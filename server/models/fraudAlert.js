const mongoose = require("mongoose");

const fraudAlertSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: true
  },

  riskScore: {
    type: Number,
    required: true
  },

  riskLevel: {
    type: String,
    required: true
  },

  priority: {
  type: String,
  enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
  default: "LOW"
},

  reasons: {
    type: [String],
    required: true
  },

  status: {
    type: String,
    default: "OPEN"
  }
},{
    timestamps: true
});

fraudAlertSchema.index(
  { transactionId: 1 },
  { unique: true }
);

const FraudAlert = mongoose.model("FraudAlert", fraudAlertSchema);

module.exports = FraudAlert;