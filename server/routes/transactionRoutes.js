const express = require("express");
const mongoose = require("mongoose");

const Transaction = require("../models/transaction");
const FraudAlert = require("../models/fraudAlert");

const authMiddleware =
  require("../middleware/authMiddleware");

const checkTransaction =
  require("../services/fraudEngine");

const router = express.Router();


// ==========================================
// GET ALL TRANSACTIONS
// ==========================================

router.get(
  "/",
  authMiddleware,
  async (req, res) => {

    try {

      const transactions =
        await Transaction.find({
          userId: req.user.id
        })
        .sort({
          transactionTime: -1
        })
        .limit(100);

      res.status(200).json({
        transactions
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Unable to load transactions"
      });

    }

  }
);


// ==========================================
// GET ONE TRANSACTION
// ==========================================

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {

    try {

      // Validate MongoDB ID first

      if (!mongoose.isValidObjectId(req.params.id)) {

        return res.status(400).json({
          message: "Invalid transaction ID"
        });

      }


      const transaction =
        await Transaction.findOne({
          _id: req.params.id,
          userId: req.user.id
        });


      if (!transaction) {

        return res.status(404).json({
          message: "Transaction not found"
        });

      }


      const fraudAlert =
        await FraudAlert.findOne({
          transactionId: transaction._id,
          userId: req.user.id
        });


      res.status(200).json({
        transaction,
        fraudAlert
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Unable to load transaction"
      });

    }

  }
);


// ==========================================
// POST NEW TRANSACTION
// ==========================================

router.post(
  "/",
  authMiddleware,
  async (req, res) => {

    try {

      const {
        amount,
        location,
        device,
        paymentMethod,
        merchant,
        transactionTime
      } = req.body;


      // ==========================================
      // BASIC REQUIRED FIELD VALIDATION
      // ==========================================

      if (
        amount === undefined ||
        amount === null ||
        location === undefined ||
        location === null ||
        device === undefined ||
        device === null
      ) {

        return res.status(400).json({
          message:
            "Amount, location and device are required"
        });

      }


      // ==========================================
      // AMOUNT VALIDATION
      // ==========================================

      const numericAmount =
        Number(amount);


      if (!Number.isFinite(numericAmount)) {

        return res.status(400).json({
          message:
            "Transaction amount must be a valid number"
        });

      }


      if (numericAmount <= 0) {

        return res.status(400).json({
          message:
            "Transaction amount must be greater than 0"
        });

      }


      if (numericAmount > 10000000) {

        return res.status(400).json({
          message:
            "Transaction amount is too large"
        });

      }


      // ==========================================
      // LOCATION VALIDATION
      // ==========================================

      if (typeof location !== "string") {

        return res.status(400).json({
          message:
            "Location must be text"
        });

      }


      const cleanLocation =
        location.trim();


      if (!cleanLocation) {

        return res.status(400).json({
          message:
            "Location cannot be empty"
        });

      }


      if (cleanLocation.length > 100) {

        return res.status(400).json({
          message:
            "Location is too long"
        });

      }


      // ==========================================
      // DEVICE VALIDATION
      // ==========================================

      if (typeof device !== "string") {

        return res.status(400).json({
          message:
            "Device must be text"
        });

      }


      const cleanDevice =
        device.trim();


      if (!cleanDevice) {

        return res.status(400).json({
          message:
            "Device cannot be empty"
        });

      }


      if (cleanDevice.length > 100) {

        return res.status(400).json({
          message:
            "Device is too long"
        });

      }


      // ==========================================
      // PAYMENT METHOD VALIDATION
      // ==========================================

      const allowedPaymentMethods = [
        "UPI",
        "CARD",
        "BANK_TRANSFER",
        "CASH",
        "OTHER"
      ];


      let finalPaymentMethod =
        paymentMethod || "OTHER";


      // Convert payment method to uppercase
      // so values like "upi" also work.

      if (typeof finalPaymentMethod === "string") {
        finalPaymentMethod =
          finalPaymentMethod.trim().toUpperCase();
      }


      if (
        !allowedPaymentMethods.includes(
          finalPaymentMethod
        )
      ) {

        return res.status(400).json({
          message:
            "Invalid payment method"
        });

      }


      // ==========================================
      // MERCHANT VALIDATION
      // ==========================================

      let cleanMerchant = "Unknown";


      if (
        merchant !== undefined &&
        merchant !== null
      ) {

        if (typeof merchant !== "string") {

          return res.status(400).json({
            message:
              "Merchant must be text"
          });

        }


        cleanMerchant =
          merchant.trim() || "Unknown";


        if (cleanMerchant.length > 150) {

          return res.status(400).json({
            message:
              "Merchant name is too long"
          });

        }

      }


      // ==========================================
      // TRANSACTION TIME VALIDATION
      // ==========================================

      let finalTransactionTime =
        new Date();


      if (
        transactionTime !== undefined &&
        transactionTime !== null
      ) {

        const parsedTransactionTime =
          new Date(transactionTime);


        if (
          Number.isNaN(
            parsedTransactionTime.getTime()
          )
        ) {

          return res.status(400).json({
            message:
              "Transaction time must be a valid date"
          });

        }


        // Do not allow transactions
        // far into the future.

        const now =
          new Date();

        const fiveMinutesFromNow =
          new Date(
            now.getTime() +
            5 * 60 * 1000
          );


        if (
          parsedTransactionTime >
          fiveMinutesFromNow
        ) {

          return res.status(400).json({
            message:
              "Transaction time cannot be in the future"
          });

        }


        finalTransactionTime =
          parsedTransactionTime;

      }


      // ==========================================
      // PREPARE CLEAN TRANSACTION DATA
      // ==========================================

      const transactionData = {

        userId:
          req.user.id,

        amount:
          numericAmount,

        // Backend decides currency.
        currency:
          "INR",

        location:
          cleanLocation,

        device:
          cleanDevice,

        paymentMethod:
          finalPaymentMethod,

        merchant:
          cleanMerchant,

        // Backend decides the source.
        // This route is always MANUAL.
        source:
          "MANUAL",

        transactionTime:
          finalTransactionTime

      };


      // ==========================================
      // CREATE TRANSACTION
      // ==========================================

      const transaction =
        new Transaction(
          transactionData
        );


      await transaction.save();


      // ==========================================
      // RUN FRAUD ENGINE
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


        // Remove transaction if
        // fraud analysis completely fails.

        await Transaction.deleteOne({
          _id: transaction._id
        });


        return res.status(500).json({
          message:
            "Unable to complete fraud analysis"
        });

      }


      // ==========================================
      // VALIDATE FRAUD ENGINE RESULT
      // ==========================================

      if (
        !fraudResult ||
        !Number.isFinite(
          Number(fraudResult.riskScore)
        )
      ) {

        await Transaction.deleteOne({
          _id: transaction._id
        });


        return res.status(500).json({
          message:
            "Unable to complete fraud analysis"
        });

      }


      // ==========================================
      // CREATE FRAUD ALERT
      // ==========================================

      let fraudAlert = null;


      if (
        Number(fraudResult.riskScore) >= 30
      ) {

        try {

          fraudAlert =
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

        } catch (alertError) {

          console.log(
            "Fraud alert creation error:",
            alertError
          );

          // Transaction itself is valid,
          // so we do not delete it.
          // The API still tells frontend
          // that the alert was not created.

          fraudAlert = null;

        }

      }


      // ==========================================
      // SEND RESPONSE
      // ==========================================

      res.status(201).json({

        message:
          "Transaction added successfully",

        transaction,

        fraudAnalysis:
          fraudResult,

        fraudAlertCreated:
          Boolean(fraudAlert),

        fraudAlert

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Unable to add transaction"
      });

    }

  }
);


module.exports = router;