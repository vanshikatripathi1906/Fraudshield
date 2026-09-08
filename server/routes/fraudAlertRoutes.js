const express = require("express");

const FraudAlert = require("../models/fraudAlert");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// GET - Get all fraud alerts of logged-in user
router.get("/", authMiddleware, async (req, res) => {

  try {

    const alerts = await FraudAlert.find({
      userId: req.user.id
    })
    .populate("transactionId")
    .sort({
      createdAt: -1
    });


    res.status(200).json({
      alerts: alerts
    });


  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});


// PUT - Update fraud alert status
router.put("/:id", authMiddleware, async (req, res) => {

  try {

    const { status } = req.body;


    // Check whether the status is valid
    if (
      status !== "REVIEWED" &&
      status !== "DISMISSED"
    ) {

      return res.status(400).json({
        message: "Invalid status"
      });

    }


    // Find alert belonging to logged-in user
    const alert = await FraudAlert.findOne({
      _id: req.params.id,
      userId: req.user.id
    });


    if (!alert) {

      return res.status(404).json({
        message: "Fraud alert not found"
      });

    }


    // Update the status
    alert.status = status;

    await alert.save();


    res.status(200).json({

      message: "Alert status updated successfully",

      alert: alert

    });


  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});


module.exports = router;