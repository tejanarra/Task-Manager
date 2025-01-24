const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { Op } = require("sequelize");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const errors = require("../utils/errors");
import "pg";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(errors.SERVER.EMAIL_SEND_FAILURE.message);
  }
};

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const createVerificationEmail = (email, verificationCode, type = "passwordReset") => {
  let subject, text;
  if (type === "passwordReset") {
    subject = "Password Reset Verification Code";
    text = `Your password reset verification code is: ${verificationCode}. This code will expire in 10 minutes.`;
  } else if (type === "registration") {
    subject = "Registration Verification Code";
    text = `Your registration verification code is: ${verificationCode}. This code will expire in 10 minutes.`;
  }
  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
  };
};

const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json(errors.REGISTRATION.MISSING_FIELDS);
  }

  try {
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }] },
    });

    if (existingUser) {
      return res.status(400).json(errors.AUTH.USER_ALREADY_EXISTS);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = generateVerificationCode();

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiration: new Date(Date.now() + 600000),
      isVerified: false,
    });

    const mailOptions = createVerificationEmail(email, verificationCode, "registration");
    await sendEmail(mailOptions);

    return res.status(200).json(errors.REGISTRATION.VERIFICATION_SENT);
  } catch (err) {
    console.error("Registration error:", err.message);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

const verifyRegistrationCode = async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(400).json(errors.REGISTRATION.MISSING_VERIFICATION_DATA);
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
      return res.status(400).json(errors.AUTH.INVALID_VERIFICATION_CODE);
    }

    user.verificationCode = null;
    user.verificationCodeExpiration = null;
    user.isVerified = true;
    await user.save();

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    return res.status(200).json({
      code: "REG006",
      message: errors.REGISTRATION.REGISTRATION_SUCCESS.message,
      token,
      userInfo: { firstName: user.firstName, lastName: user.lastName, email: user.email },
    });
  } catch (err) {
    console.error("Verification error:", err.message);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      code: "AUTH007",
      message: "Email and password are required.",
    });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json(errors.AUTH.INVALID_CREDENTIALS);
    }

    if (!user.isVerified) {
      return res.status(400).json(errors.AUTH.USER_NOT_VERIFIED);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json(errors.AUTH.INVALID_CREDENTIALS);
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });

    return res.status(200).json({
      code: "AUTH008",
      message: "Login successful.",
      token,
      userInfo: { firstName: user.firstName, lastName: user.lastName, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json(errors.PASSWORD.MISSING_EMAIL);
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json(errors.PASSWORD.VERIFICATION_SENT);
    }

    const verificationCode = generateVerificationCode();

    user.verificationCode = verificationCode;
    user.verificationCodeExpiration = new Date(Date.now() + 600000);
    await user.save();

    const mailOptions = createVerificationEmail(email, verificationCode, "passwordReset");
    await sendEmail(mailOptions);

    return res.status(200).json(errors.PASSWORD.VERIFICATION_SENT);
  } catch (err) {
    console.error("Forgot Password error:", err.message);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

const verifyVerificationCode = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  if (!email || !verificationCode || !newPassword) {
    return res.status(400).json({
      code: "PWD004",
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
      return res.status(400).json(errors.AUTH.INVALID_VERIFICATION_CODE);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.verificationCode = null;
    user.verificationCodeExpiration = null;
    await user.save();

    return res.status(200).json({
      code: "PWD005",
      message: "Password successfully reset. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("Verification Code error:", err.message);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      code: "REG005",
      message: "Email is required to resend verification code.",
    });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json(errors.REGISTRATION.VERIFICATION_RESENT);
    }

    if (user.isVerified) {
      return res.status(400).json({
        code: "REG006",
        message: "User is already verified.",
      });
    }

    const verificationCode = generateVerificationCode();

    user.verificationCode = verificationCode;
    user.verificationCodeExpiration = new Date(Date.now() + 600000);
    await user.save();

    const mailOptions = createVerificationEmail(email, verificationCode, "registration");
    await sendEmail(mailOptions);

    return res.status(200).json(errors.REGISTRATION.VERIFICATION_RESENT);
  } catch (err) {
    console.error("Resend Verification Email error:", err.message);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

const sendContactFormEmail = async (req, res) => {
  const { yourName, yourEmail, subject, message } = req.body;

  if (!yourName || !yourEmail || !subject || !message) {
    return res.status(400).json({
      code: "CNT003",
      message: "All fields (name, email, subject, message) are required.",
    });
  }

  const mailOptions = {
    from: yourEmail,
    to: process.env.CONTACT_FORM_RECEIVER_EMAIL || "narrateja9699@gmail.com",
    subject: `New Contact Form Submission: ${subject}`,
    text: `Message from ${yourName} (${yourEmail}):\n\n${message}`,
  };

  try {
    await sendEmail(mailOptions);
    return res.status(200).json({
      code: "CNT004",
      message: "Your message has been sent successfully. We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact Form Email error:", error.message);
    return res.status(500).json({
      code: "CNT005",
      message: "Failed to send your message. Please try again later.",
    });
  }
};

module.exports = {
  registerUser,
  verifyRegistrationCode,
  loginUser,
  forgotPassword,
  verifyVerificationCode,
  resendVerificationEmail,
  sendContactFormEmail,
};