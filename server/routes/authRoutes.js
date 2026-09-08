const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();


// ==========================================
// LOGIN RATE LIMITER
// ==========================================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message:
      "Too many login attempts. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});


// ==========================================
// REGISTER
// ==========================================

router.post(
  "/register",
  async (req, res) => {

    try {

      const {
        name,
        email,
        password
      } = req.body;


      // ==========================================
      // REQUIRED FIELD VALIDATION
      // ==========================================

      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {

        return res.status(400).json({
          message:
            "Name, email and password are required"
        });

      }


      // ==========================================
      // CLEAN INPUT
      // ==========================================

      const cleanName =
        name.trim();

      const cleanEmail =
        email.trim().toLowerCase();


      // ==========================================
      // NAME VALIDATION
      // ==========================================

      if (!cleanName) {

        return res.status(400).json({
          message:
            "Name cannot be empty"
        });

      }


      if (cleanName.length > 100) {

        return res.status(400).json({
          message:
            "Name is too long"
        });

      }


      // ==========================================
      // EMAIL VALIDATION
      // ==========================================

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      if (!emailRegex.test(cleanEmail)) {

        return res.status(400).json({
          message:
            "Please provide a valid email address"
        });

      }


      if (cleanEmail.length > 150) {

        return res.status(400).json({
          message:
            "Email is too long"
        });

      }


      // ==========================================
      // PASSWORD VALIDATION
      // ==========================================

      if (password.length < 8) {

        return res.status(400).json({
          message:
            "Password must be at least 8 characters"
        });

      }


      if (password.length > 128) {

        return res.status(400).json({
          message:
            "Password is too long"
        });

      }


      // ==========================================
      // CHECK EXISTING USER
      // ==========================================

      const existingUser =
        await User.findOne({
          email: cleanEmail
        });


      if (existingUser) {

        return res.status(409).json({
          message:
            "User already exists"
        });

      }


      // ==========================================
      // HASH PASSWORD
      // ==========================================

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );


      // ==========================================
      // CREATE USER
      // ==========================================

      const user =
        new User({

          name:
            cleanName,

          email:
            cleanEmail,

          password:
            hashedPassword,

          role:
            "USER"

        });


      await user.save();


      // ==========================================
      // RESPONSE
      // ==========================================

      return res.status(201).json({

        message:
          "Registration successful",

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role
        }

      });

    } catch (error) {

      console.log(error);

      // MongoDB duplicate-key protection
      if (error.code === 11000) {

        return res.status(409).json({
          message:
            "User already exists"
        });

      }

      return res.status(500).json({
        message:
          "Unable to register user"
      });

    }

  }
);


// ==========================================
// LOGIN
// ==========================================

router.post(
  "/login",
  loginLimiter,
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;


      // ==========================================
      // REQUIRED FIELD VALIDATION
      // ==========================================

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {

        return res.status(400).json({
          message:
            "Email and password are required"
        });

      }


      const cleanEmail =
        email.trim().toLowerCase();


      // ==========================================
      // FIND USER
      // ==========================================

      const user =
        await User.findOne({
          email: cleanEmail
        });


      if (!user) {

        return res.status(401).json({
          message:
            "Invalid email or password"
        });

      }


      // ==========================================
      // CHECK PASSWORD
      // ==========================================

      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password
        );


      if (!passwordMatches) {

        return res.status(401).json({
          message:
            "Invalid email or password"
        });

      }


      // ==========================================
      // CREATE JWT
      // ==========================================

      const token =
        jwt.sign(
          {
            id:
              user._id.toString(),

            role:
              user.role
          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              "1d"
          }
        );


      // ==========================================
      // STORE JWT IN HTTP-ONLY COOKIE
      // ==========================================

      res.cookie(
        "token",
        token,
        {
          httpOnly:
            true,

          secure:
            process.env.NODE_ENV === "production",

          sameSite:
            "lax",

          maxAge:
            24 * 60 * 60 * 1000
        }
      );


      // ==========================================
      // RESPONSE
      // ==========================================

      return res.status(200).json({

        message:
          "Login successful",

        user: {
          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role
        }

      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        message:
          "Unable to login"
      });

    }

  }
);


// ==========================================
// PROFILE
// ==========================================

router.get(
  "/profile",
  authMiddleware,
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.id
        ).select(
          "-password"
        );


      if (!user) {

        return res.status(404).json({
          message:
            "User not found"
        });

      }


      return res.status(200).json({
        user
      });

    } catch (error) {

      console.log(error);

      return res.status(500).json({
        message:
          "Unable to load profile"
      });

    }

  }
);


// ==========================================
// LOGOUT
// ==========================================

router.post(
  "/logout",
  (req, res) => {

    res.clearCookie(
      "token",
      {
        httpOnly:
          true,

        secure:
          process.env.NODE_ENV === "production",

        sameSite:
          "lax"
      }
    );


    return res.status(200).json({
      message:
        "Logout successful"
    });

  }
);


// ==========================================
// ADMIN TEST
// ==========================================

router.get(
  "/admin-test",
  authMiddleware,
  adminMiddleware,
  (req, res) => {

    return res.status(200).json({

      message:
        "Admin access verified",

      user: {
        id:
          req.user.id,

        role:
          req.user.role
      }

    });

  }
);


module.exports = router;