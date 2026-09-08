const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const Transaction = require("../models/transaction");
const FraudAlert = require("../models/fraudAlert");

const authMiddleware =
  require("../middleware/authMiddleware");

const checkTransaction =
  require("../services/fraudEngine");

const router = express.Router();


// ==========================================
// CSV UPLOAD CONFIGURATION
// ==========================================

const upload = multer({

  dest: "uploads/",

  limits: {
    fileSize: 2 * 1024 * 1024
  },

  fileFilter: (req, file, callback) => {

    const fileName =
      file.originalname.toLowerCase();

    const isCSV =
      fileName.endsWith(".csv");

    if (!isCSV) {

      return callback(
        new Error("Only CSV files are allowed")
      );

    }

    callback(null, true);

  }

});


// ==========================================
// POST - UPLOAD CSV STATEMENT
// ==========================================

router.post(
  "/csv",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {

    let filePath = null;

    try {

      // ==========================================
      // CHECK FILE
      // ==========================================

      if (!req.file) {

        return res.status(400).json({
          message:
            "Please upload a CSV file"
        });

      }


      filePath =
        req.file.path;


      const transactions = [];


      // ==========================================
      // READ CSV FILE
      // ==========================================

      fs.createReadStream(filePath)

        .pipe(csv())

        .on("data", (row) => {

          // Maximum 1000 rows.
          if (transactions.length < 1000) {
            transactions.push(row);
          }

        })

        .on("end", async () => {

          try {

            let importedTransactions = 0;
            let fraudAlerts = 0;


            // ==========================================
            // CHECK ROW LIMIT
            // ==========================================

            if (transactions.length >= 1000) {

              // We intentionally allow the first
              // 1000 rows only.

              console.log(
                "CSV row limit reached"
              );

            }


            // ==========================================
            // PROCESS TRANSACTIONS
            // ==========================================

            for (
              const row of transactions
            ) {

              // ==========================================
              // AMOUNT
              // ==========================================

              const amount =
                Number(row.amount);


              if (
                !Number.isFinite(amount) ||
                amount <= 0
              ) {

                continue;

              }


              if (amount > 10000000) {

                continue;

              }


              // ==========================================
              // LOCATION
              // ==========================================

              if (
                typeof row.location !==
                "string"
              ) {

                continue;

              }


              const location =
                row.location.trim();


              if (!location) {

                continue;

              }


              if (
                location.length > 100
              ) {

                continue;

              }


              // ==========================================
              // DEVICE
              // ==========================================

              if (
                typeof row.device !==
                "string"
              ) {

                continue;

              }


              const device =
                row.device.trim();


              if (!device) {

                continue;

              }


              if (
                device.length > 100
              ) {

                continue;

              }


              // ==========================================
              // PAYMENT METHOD
              // ==========================================

              const allowedPaymentMethods = [
                "UPI",
                "CARD",
                "BANK_TRANSFER",
                "CASH",
                "OTHER"
              ];


              let paymentMethod =
                row.paymentMethod
                  ? row.paymentMethod
                      .trim()
                      .toUpperCase()
                  : "OTHER";


              if (
                !allowedPaymentMethods.includes(
                  paymentMethod
                )
              ) {

                paymentMethod =
                  "OTHER";

              }


              // ==========================================
              // MERCHANT
              // ==========================================

              let merchant =
                "Unknown";


              if (
                typeof row.merchant ===
                "string"
              ) {

                merchant =
                  row.merchant.trim() ||
                  "Unknown";

              }


              if (
                merchant.length > 150
              ) {

                continue;

              }


              // ==========================================
              // TRANSACTION DATE
              // ==========================================

              let transactionTime =
                new Date();


              if (row.transactionTime) {

                const parsedDate =
                  new Date(
                    row.transactionTime
                  );


                if (
                  Number.isNaN(
                    parsedDate.getTime()
                  )
                ) {

                  continue;

                }


                // Do not accept
                // future transactions.

                const now =
                  new Date();

                const fiveMinutesFromNow =
                  new Date(
                    now.getTime() +
                    5 * 60 * 1000
                  );


                if (
                  parsedDate >
                  fiveMinutesFromNow
                ) {

                  continue;

                }


                transactionTime =
                  parsedDate;

              }


              // ==========================================
              // CREATE TRANSACTION
              // ==========================================

              const transaction =
                new Transaction({

                  userId:
                    req.user.id,

                  amount:
                    amount,

                  // Backend decides currency.
                  currency:
                    "INR",

                  paymentMethod:
                    paymentMethod,

                  merchant:
                    merchant,

                  // Backend decides source.
                  source:
                    "CSV",

                  location:
                    location,

                  device:
                    device,

                  transactionTime:
                    transactionTime

                });


              // ==========================================
              // SAVE TRANSACTION
              // ==========================================

              await transaction.save();

              importedTransactions++;


              // ==========================================
              // FRAUD ANALYSIS
              // ==========================================

              let fraudResult;


              try {

                fraudResult =
                  await checkTransaction(
                    transaction
                  );

              } catch (fraudError) {

                console.log(
                  "Fraud engine error:",
                  fraudError
                );

                // Transaction is already saved.
                // We skip alert creation for
                // this transaction.

                continue;

              }


              // ==========================================
              // VALIDATE FRAUD RESULT
              // ==========================================

              if (
                !fraudResult ||
                !Number.isFinite(
                  Number(
                    fraudResult.riskScore
                  )
                )
              ) {

                continue;

              }


              // ==========================================
              // CREATE FRAUD ALERT
              // ==========================================

              if (
                Number(
                  fraudResult.riskScore
                ) >= 30
              ) {

                try {

                  const fraudAlert =
                    new FraudAlert({

                      userId:
                        req.user.id,

                      transactionId:
                        transaction._id,

                      riskScore:
                        Number(
                          fraudResult.riskScore
                        ),

                      riskLevel:
                        fraudResult.riskLevel,

                      priority:
                        fraudResult.priority,

                      reasons:
                        Array.isArray(
                          fraudResult.reasons
                        )
                          ? fraudResult.reasons
                          : [],

                      status:
                        "OPEN"

                    });


                  await fraudAlert.save();

                  fraudAlerts++;

                } catch (alertError) {

                  console.log(
                    "Fraud alert creation error:",
                    alertError
                  );

                }

              }

            }


            // ==========================================
            // DELETE TEMPORARY FILE
            // ==========================================

            if (
              filePath &&
              fs.existsSync(filePath)
            ) {

              fs.unlinkSync(filePath);

            }


            // ==========================================
            // SEND RESPONSE
            // ==========================================

            res.status(200).json({

              message:
                "CSV uploaded successfully",

              importedTransactions:
                importedTransactions,

              fraudAlerts:
                fraudAlerts

            });

          } catch (error) {

            console.log(error);


            // Cleanup temporary file

            if (
              filePath &&
              fs.existsSync(filePath)
            ) {

              fs.unlinkSync(filePath);

            }


            res.status(500).json({
              message:
                "Error processing CSV"
            });

          }

        })

        .on("error", (error) => {

          console.log(error);


          if (
            filePath &&
            fs.existsSync(filePath)
          ) {

            fs.unlinkSync(filePath);

          }


          res.status(400).json({
            message:
              "Unable to read CSV file"
          });

        });

    } catch (error) {

      console.log(error);


      if (
        filePath &&
        fs.existsSync(filePath)
      ) {

        fs.unlinkSync(filePath);

      }


      // Handle multer errors

      if (
        error.message ===
        "Only CSV files are allowed"
      ) {

        return res.status(400).json({
          message:
            "Only CSV files are allowed"
        });

      }


      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {

        return res.status(400).json({
          message:
            "CSV file must be smaller than 2 MB"
        });

      }


      res.status(500).json({
        message:
          "Server error while uploading CSV"
      });

    }

  }
);


module.exports = router;