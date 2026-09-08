const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },

    paymentMethod: {
      type: String,
      enum: ["UPI", "CARD", "BANK_TRANSFER", "CASH", "OTHER"],
      default: "OTHER",
    },

    merchant: {
      type: String,
      default: "Unknown",
    },

    source: {
      type: String,
      enum: ["MANUAL", "CSV", "ACCOUNT_AGGREGATOR"],
      default: "MANUAL",
    },

    location: {
      type: String,
      required: true,
    },

    device: {
      type: String,
      required: true,
    },

    transactionTime: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "COMPLETED",
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.index({ userId: 1, transactionTime: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
