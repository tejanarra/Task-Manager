const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { Op } = require("sequelize");
const dotenv = require("dotenv");
// import "pg"
dotenv.config();

const nodemailer = require("nodemailer");
const crypto = require("crypto");

const sendVerificationEmail = async (email, verificationCode) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Verification Code",
    text: `Your verification code is: ${verificationCode}. This code will expire in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "No user found with that email" });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.verificationCode = verificationCode;
    user.verificationCodeExpiration = Date.now() + 600000;

    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({
      message: "Verification code sent. Please check your inbox.",
    });
  } catch (err) {
    console.error("Error during password reset:", err.message || err);
    res.status(500).json({ message: "Server error during password reset" });
  }
};

const verifyVerificationCode = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  if (!email || !verificationCode || !newPassword) {
    return res
      .status(400)
      .json({
        message: "Email, verification code, and new password are required.",
      });
  }

  try {
    const user = await User.findOne({
      where: {
        email,
        verificationCode,
        verificationCodeExpiration: { [Op.gte]: Date.now() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.verificationCode = null;
    user.verificationCodeExpiration = null;

    await user.save();

    res.status(200).json({
      message:
        "Password successfully reset. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("Error verifying code:", err.message || err);
    res.status(500).json({ message: "Server error during code verification" });
  }
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Generate a verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create the user with only username, email, and password (but don't set them as active yet)
    const user = await User.create({
      username,
      email,
      password,
      verificationCode,
      verificationCodeExpiration: Date.now() + 600000, // 10 minutes expiration
    });

    // Send the verification code to the user's email
    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({
      message: "A verification code has been sent to your email. Please verify to complete the registration.",
    });
  } catch (err) {
    console.error("Error during registration:", err.message || err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

const verifyRegistrationCode = async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(400).json({
      message: "Email and verification code are required to verify your registration.",
    });
  }

  try {
    const user = await User.findOne({
      where: {
        email,
        verificationCode,
        verificationCodeExpiration: { [Op.gte]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    // Mark the user as verified
    user.verificationCode = null;
    user.verificationCodeExpiration = null;
    user.isVerified = true; // Assume you have an `isVerified` field on your User model

    await user.save();

    // Generate a JWT token for the user
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    res.status(200).json({
      message: "Registration successful. You can now log in.",
      token,
      userInfo: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Error during verification:", err.message || err);
    res.status(500).json({ message: "Server error during code verification" });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "email and password are required." });
  }

  try {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    res.status(200).json({
      token,
      userInfo: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyToken = async (req, res) => {
  res.status(200).json({ message: "Valid Token" });
};

module.exports = { registerUser, loginUser, verifyToken, forgotPassword, verifyVerificationCode, verifyRegistrationCode };
