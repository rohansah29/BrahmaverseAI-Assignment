const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { UserModel } = require("../models/userModel");

const userRouter = express.Router();

// ============================================
// EMAIL VALIDATION
// ============================================

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================
// REGISTER EMPLOYEE
// ============================================

userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate name
    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).send({
        error: "Name must contain at least 2 characters",
      });
    }

    // Validate email
    if (typeof email !== "string" || !emailPattern.test(email.trim())) {
      return res.status(400).send({
        error: "Valid email is required",
      });
    }

    // Validate password
    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).send({
        error: "Password must be 8–72 characters",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if employee already exists
    const existingUser = await UserModel.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).send({
        error: "Employee already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new employee
    const user = new UserModel({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Save employee in MongoDB
    await user.save();

    // Return success response
    return res.status(201).send({
      msg: "Employee registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Handle duplicate email
    if (error.code === 11000) {
      return res.status(409).send({
        error: "Employee already exists",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).send({
      error: "Registration failed",
    });
  }
});

// ============================================
// LOGIN EMPLOYEE
// ============================================

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate login input
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).send({
        error: "Email and password are required",
      });
    }

    // Find employee using normalized email
    const user = await UserModel.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    // Check whether employee exists
    if (!user) {
      return res.status(401).send({
        error: "Invalid email or password",
      });
    }

    // Compare entered password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send({
        error: "Invalid email or password",
      });
    }

    // Ensure JWT secret is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment");

      return res.status(500).send({
        error: "Authentication configuration error",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userID: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      },
    );

    // Return login response
    return res.status(200).send({
      msg: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).send({
      error: "Login failed",
    });
  }
});

// ============================================
// EXPORT ROUTER
// ============================================

module.exports = { userRouter };
