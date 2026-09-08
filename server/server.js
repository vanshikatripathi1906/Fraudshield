const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const fraudAlertRoutes = require("./routes/fraudAlertRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const adminRoutes = require("./routes/adminRoutes");
const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api/", apiLimiter);

app.use(helmet());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/fraud-alerts", fraudAlertRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("FraudShield server is running!");
});

app.use((error, req, res, next) => {
  console.log(error);

  res.status(500).json({
    message: "Something went wrong",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed");
    console.log(error);
  });
