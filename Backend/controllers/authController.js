const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { Op } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();
import "pg";

const nodemailer = require("nodemailer");

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

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Error sending verification email: " + error.message);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required", code: "E001" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with that email", code: "E002" });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpiration = Date.now() + 600000; // 10 minutes expiration

    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({
      message: "Verification code sent. Please check your inbox.",
      code: "S001",
    });
  } catch (err) {
    console.error("Error during password reset:", err.message);
    res
      .status(500)
      .json({ message: "Server error during password reset", code: "S002" });
  }
};

const verifyVerificationCode = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  if (!email || !verificationCode || !newPassword) {
    return res.status(400).json({
      message: "Email, verification code, and new password are required.",
      code: "E003",
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
      return res.status(400).json({
        message: "Invalid or expired verification code",
        code: "E004",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.verificationCode = null;
    user.verificationCodeExpiration = null;

    await user.save();

    res.status(200).json({
      message:
        "Password successfully reset. You can now log in with your new password.",
      code: "S002",
    });
  } catch (err) {
    console.error("Error verifying code:", err.message);
    res
      .status(500)
      .json({ message: "Server error during code verification", code: "S003" });
  }
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Username, email, and password are required.",
      code: "E005",
    });
  }

  try {
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }] },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email or username.",
        code: "E006",
      });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = await User.create({
      username,
      email,
      password,
      verificationCode,
      verificationCodeExpiration: Date.now() + 600000,
    });

    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({
      message:
        "A verification code has been sent to your email. Please verify to complete the registration.",
      code: "S003",
    });
  } catch (err) {
    console.error("Error during registration:", err.message);
    res.status(500).json({
      message: "Server error during registration",
      code: "S004",
    });
  }
};

const verifyRegistrationCode = async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(400).json({
      message:
        "Email and verification code are required to verify your registration.",
      code: "E007",
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
      return res.status(400).json({
        message: "Invalid or expired verification code",
        code: "E008",
      });
    }

    user.verificationCode = null;
    user.verificationCodeExpiration = null;
    user.isVerified = true;

    await user.save();

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    res.status(200).json({
      message: "Registration successful. You can now log in.",
      code: "S004",
      token,
      userInfo: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Error during verification:", err.message);
    res.status(500).json({
      message: "Server error during code verification",
      code: "S005",
    });
  }
};

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required to resend verification code.",
      code: "E012",
    });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        message: "No user found with that email.",
        code: "E013",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "User is already verified.",
        code: "E014",
      });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpiration = Date.now() + 600000;

    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({
      message: "A new verification code has been sent to your email.",
      code: "S006",
    });
  } catch (err) {
    console.error("Error during resending verification code:", err.message);
    res.status(500).json({
      message: "Server error while resending verification code.",
      code: "S007",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required.",
      code: "E009",
    });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials.",
        code: "E010",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message:
          "User is not verified. Please verify your account before logging in.",
        code: "E015",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials.",
        code: "E011",
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    res.status(200).json({
      message: "Login successful.",
      code: "S005",
      token,
      userInfo: { username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({
      message: "Server error during login",
      code: "S006",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  verifyVerificationCode,
  verifyRegistrationCode,
  resendVerificationEmail,
};
