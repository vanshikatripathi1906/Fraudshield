const express = require("express");

const User = require("../models/user");
const Transaction = require("../models/transaction");
const FraudAlert = require("../models/fraudAlert");

const authMiddleware =
  require("../middleware/authMiddleware");

const adminMiddleware =
  require("../middleware/adminMiddleware");

const router = express.Router();


// ==========================================
// ADMIN STATISTICS
// ==========================================

router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {

    try {

      // ======================================
      // BASIC COUNTS
      // ======================================

      const totalUsers =
        await User.countDocuments();

      const totalTransactions =
        await Transaction.countDocuments();

      const totalFraudAlerts =
        await FraudAlert.countDocuments();


      // ======================================
      // ALERT STATUS COUNTS
      // ======================================

      const openFraudAlerts =
        await FraudAlert.countDocuments({
          status: "OPEN"
        });

      const reviewedAlerts =
        await FraudAlert.countDocuments({
          status: "REVIEWED"
        });

      const dismissedAlerts =
        await FraudAlert.countDocuments({
          status: "DISMISSED"
        });


      // ======================================
      // RISK COUNTS
      // ======================================

      const criticalAlerts =
        await FraudAlert.countDocuments({
          riskLevel: "CRITICAL"
        });

      const highAlerts =
        await FraudAlert.countDocuments({
          riskLevel: "HIGH"
        });

      const mediumAlerts =
        await FraudAlert.countDocuments({
          riskLevel: "MEDIUM"
        });

      const lowAlerts =
        await FraudAlert.countDocuments({
          riskLevel: "LOW"
        });


      // ======================================
      // HIGH RISK COUNT
      // HIGH + CRITICAL
      // ======================================

      const highRiskAlerts =
        await FraudAlert.countDocuments({
          riskLevel: {
            $in: ["HIGH", "CRITICAL"]
          }
        });


      // ======================================
      // OPEN CRITICAL ALERTS
      // ======================================

      const openCriticalAlerts =
        await FraudAlert.countDocuments({
          riskLevel: "CRITICAL",
          status: "OPEN"
        });


      // ======================================
      // OPEN HIGH RISK ALERTS
      // HIGH + CRITICAL
      // ======================================

      const openHighRiskAlerts =
        await FraudAlert.countDocuments({
          riskLevel: {
            $in: ["HIGH", "CRITICAL"]
          },
          status: "OPEN"
        });


      // ======================================
      // GET ALL FRAUD ALERTS
      // ======================================

      const allFraudAlerts =
        await FraudAlert.find()
          .populate("transactionId");


      // ======================================
      // AVERAGE RISK SCORE
      // ======================================

      let totalRiskScore = 0;

      for (
        const alert of allFraudAlerts
      ) {

        totalRiskScore =
          totalRiskScore +
          alert.riskScore;

      }


      let averageRiskScore = 0;

      if (totalFraudAlerts > 0) {

        averageRiskScore =
          Math.round(
            totalRiskScore /
            totalFraudAlerts
          );

      }


      // ======================================
      // AVERAGE FRAUD TRANSACTION AMOUNT
      // ======================================

      let totalFraudAmount = 0;

      let fraudAmountCount = 0;


      for (
        const alert of allFraudAlerts
      ) {

        if (
          alert.transactionId &&
          typeof alert.transactionId.amount === "number"
        ) {

          totalFraudAmount =
            totalFraudAmount +
            alert.transactionId.amount;

          fraudAmountCount++;

        }

      }


      let averageFraudAmount = 0;

      if (fraudAmountCount > 0) {

        averageFraudAmount =
          Math.round(
            totalFraudAmount /
            fraudAmountCount
          );

      }


      // ======================================
      // MOST COMMON FRAUD REASON
      // ======================================

      const reasonCounts = {};


      for (
        const alert of allFraudAlerts
      ) {

        for (
          const reason of alert.reasons
        ) {

          if (!reasonCounts[reason]) {

            reasonCounts[reason] = 0;

          }

          reasonCounts[reason]++;

        }

      }


      let mostCommonReason =
        "No fraud reason available";


      let highestReasonCount = 0;


      for (
        const reason in reasonCounts
      ) {

        if (
          reasonCounts[reason] >
          highestReasonCount
        ) {

          highestReasonCount =
            reasonCounts[reason];

          mostCommonReason =
            reason;

        }

      }


      // ======================================
      // RECENT ALERTS
      // ======================================

      const recentAlerts =
        await FraudAlert.find()
          .populate("userId", "name email")
          .populate("transactionId")
          .sort({
            createdAt: -1
          })
          .limit(5);


      // ======================================
      // SEND RESPONSE
      // ======================================

      res.status(200).json({

        totalUsers:
          totalUsers,

        totalTransactions:
          totalTransactions,

        totalFraudAlerts:
          totalFraudAlerts,

        openFraudAlerts:
          openFraudAlerts,

        reviewedAlerts:
          reviewedAlerts,

        dismissedAlerts:
          dismissedAlerts,

        criticalAlerts:
          criticalAlerts,

        highAlerts:
          highAlerts,

        mediumAlerts:
          mediumAlerts,

        lowAlerts:
          lowAlerts,

        highRiskAlerts:
          highRiskAlerts,

        openCriticalAlerts:
          openCriticalAlerts,

        openHighRiskAlerts:
          openHighRiskAlerts,

        averageRiskScore:
          averageRiskScore,

        averageFraudAmount:
          averageFraudAmount,

        mostCommonReason:
          mostCommonReason,

        recentAlerts:
          recentAlerts

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Unable to load admin statistics"
      });

    }

  }
);


// ==========================================
// ADMIN ALERT SEARCH
// ==========================================

router.get(
  "/alerts",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {

    try {

      const {
        riskLevel,
        status,
        search
      } = req.query;


      let query = {};


      // ======================================
      // RISK FILTER
      // ======================================

      if (
        riskLevel &&
        riskLevel !== "ALL"
      ) {

        query.riskLevel =
          riskLevel;

      }


      // ======================================
      // STATUS FILTER
      // ======================================

      if (
        status &&
        status !== "ALL"
      ) {

        query.status =
          status;

      }


      // ======================================
      // SEARCH USERS
      // ======================================

      let userIds = [];


      if (
        search &&
        search.trim() !== ""
      ) {

        const users =
          await User.find({

            $or: [

              {
                name: {
                  $regex: search,
                  $options: "i"
                }
              },

              {
                email: {
                  $regex: search,
                  $options: "i"
                }
              }

            ]

          }).select("_id");


        userIds =
          users.map(
            (user) => user._id
          );

      }


      // ======================================
      // GET ALERTS
      // ======================================

      let alerts =
        await FraudAlert.find(query)
          .populate(
            "userId",
            "name email"
          )
          .populate(
            "transactionId"
          )
          .sort({
            createdAt: -1
          })
          .limit(50);


      // ======================================
      // CLIENT-SIDE STYLE SEARCH
      // ======================================

      if (
        search &&
        search.trim() !== ""
      ) {

        const searchText =
          search.toLowerCase();


        alerts =
          alerts.filter(
            (alert) => {

              const userName =
                alert.userId?.name ||
                "";

              const userEmail =
                alert.userId?.email ||
                "";

              const merchant =
                alert.transactionId?.merchant ||
                "";

              const location =
                alert.transactionId?.location ||
                "";

              const device =
                alert.transactionId?.device ||
                "";


              return (

                userName
                  .toLowerCase()
                  .includes(searchText)

                ||

                userEmail
                  .toLowerCase()
                  .includes(searchText)

                ||

                merchant
                  .toLowerCase()
                  .includes(searchText)

                ||

                location
                  .toLowerCase()
                  .includes(searchText)

                ||

                device
                  .toLowerCase()
                  .includes(searchText)

              );

            }
          );

      }


      res.status(200).json({

        alerts:
          alerts

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Unable to load admin alerts"
      });

    }

  }
);


// ==========================================
// UPDATE ADMIN ALERT STATUS
// ==========================================

router.put(
  "/alerts/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {

    try {

      const {
        status
      } = req.body;


      if (
        status !== "REVIEWED" &&
        status !== "DISMISSED"
      ) {

        return res.status(400).json({
          message:
            "Invalid alert status"
        });

      }


      const alert =
        await FraudAlert.findById(
          req.params.id
        );


      if (!alert) {

        return res.status(404).json({
          message:
            "Fraud alert not found"
        });

      }


      alert.status =
        status;


      await alert.save();


      res.status(200).json({

        message:
          `Alert marked as ${status.toLowerCase()}`,

        alert:
          alert

      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message:
          "Unable to update alert"
      });

    }

  }
);


module.exports = router;