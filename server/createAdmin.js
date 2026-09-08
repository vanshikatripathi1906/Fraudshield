const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const User = require("./models/user");

const createAdmin = async () => {

  try {

    await mongoose.connect(process.env.MONGO_URL);

    const existingAdmin = await User.findOne({
      email: "admin@fraudshield.com"
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(
      "Admin@12345",
      10
    );

    const admin = new User({
      name: "FraudShield Admin",
      email: "admin@fraudshield.com",
      password: hashedPassword,
      role: "ADMIN"
    });

    await admin.save();

    console.log("Admin account created successfully");

    process.exit();

  } catch (error) {

    console.log("Error creating admin");
    console.log(error);

    process.exit(1);
  }
};

createAdmin();