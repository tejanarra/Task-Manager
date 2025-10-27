import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { OAuth2Client } from "google-auth-library";
import prisma from "../utils/prismaClient.js";
import errors from "../utils/errors.js";
import { sendEmail } from "../utils/mailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const oauthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const signJwt = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "1h",
  });

const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const createVerificationEmail = async (
  email,
  verificationCode,
  type = "passwordReset",
  userName = ""
) => {
  let subject, text, purpose;
  if (type === "passwordReset") {
    subject = "Password Reset Verification Code";
    text = `Your password reset verification code is: ${verificationCode}. This code will expire in 10 minutes.`;
    purpose = "Password Reset";
  } else {
    subject = "Registration Verification Code";
    text = `Your registration verification code is: ${verificationCode}. This code will expire in 10 minutes.`;
    purpose = "Registration";
  }

  const htmlContent = await ejs.renderFile(
    path.join(__dirname, "../templates/verificationEmail.ejs"),
    { userName, verificationCode, purpose, theme: "dark" }
  );

  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text,
    html: htmlContent,
  };
};

export const googleLogin = async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res
      .status(400)
      .json({ code: "AUTH009", message: "Authorization code is required." });
  }

  try {
    const { tokens } = await oauthClient.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, email_verified } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");

      user = await prisma.user.create({
        data: {
          firstName: given_name || "User",
          lastName: family_name || "Google",
          email,
          password: await bcrypt.hash(randomPassword, 10),
          avatar: picture || null,
          isVerified: Boolean(email_verified),
        },
      });
    } else if (!user.avatar && picture) {
      await prisma.user.update({
        where: { id: user.id },
        data: { avatar: picture },
      });
    }

    const token = signJwt(user.id);

    return res.status(200).json({
      code: "AUTH010",
      message: "Google login successful.",
      token,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json(errors.REGISTRATION.MISSING_FIELDS);
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json(errors.AUTH.USER_ALREADY_EXISTS);

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = generateVerificationCode();

    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        isVerified: false,
        verificationCode,
        verificationCodeExpiration: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const mailOptions = await createVerificationEmail(
      email,
      verificationCode,
      "registration",
      firstName
    );
    await sendEmail(mailOptions);

    return res.status(200).json(errors.REGISTRATION.VERIFICATION_SENT);
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

export const verifyRegistrationCode = async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(400).json(errors.REGISTRATION.MISSING_VERIFICATION_DATA);
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        verificationCode,
        verificationCodeExpiration: { gte: new Date() },
      },
    });

    if (!user)
      return res.status(400).json(errors.AUTH.INVALID_VERIFICATION_CODE);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiration: null,
      },
    });

    const token = signJwt(user.id);

    return res.status(200).json({
      code: "REG006",
      message: errors.REGISTRATION.REGISTRATION_SUCCESS.message,
      token,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ code: "AUTH007", message: "Email and password are required." });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json(errors.AUTH.INVALID_CREDENTIALS);
    if (!user.isVerified)
      return res.status(400).json(errors.AUTH.USER_NOT_VERIFIED);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json(errors.AUTH.INVALID_CREDENTIALS);

    const token = signJwt(user.id);

    return res.status(200).json({
      code: "AUTH008",
      message: "Login successful.",
      token,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json(errors.PASSWORD.MISSING_EMAIL);

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond success to avoid enumeration
    if (!user) return res.status(200).json(errors.PASSWORD.VERIFICATION_SENT);

    const verificationCode = generateVerificationCode();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpiration: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const mailOptions = await createVerificationEmail(
      email,
      verificationCode,
      "passwordReset",
      user.firstName
    );
    await sendEmail(mailOptions);

    return res.status(200).json(errors.PASSWORD.VERIFICATION_SENT);
  } catch (err) {
    console.error("Forgot Password error:", err);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

export const verifyVerificationCode = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  if (!email || !verificationCode || !newPassword) {
    return res.status(400).json({
      code: "PWD004",
      message: "Email, verification code, and new password are required.",
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        verificationCode,
        verificationCodeExpiration: { gte: new Date() },
      },
    });

    if (!user)
      return res.status(400).json(errors.AUTH.INVALID_VERIFICATION_CODE);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationCode: null,
        verificationCodeExpiration: null,
      },
    });

    return res.status(200).json({
      code: "PWD005",
      message:
        "Password successfully reset. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("Verification Code error:", err);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({
      code: "REG005",
      message: "Email is required to resend verification code.",
    });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return res.status(200).json(errors.REGISTRATION.VERIFICATION_RESENT);

    if (user.isVerified) {
      return res
        .status(400)
        .json({ code: "REG006", message: "User is already verified." });
    }

    const verificationCode = generateVerificationCode();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpiration: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const mailOptions = await createVerificationEmail(
      email,
      verificationCode,
      "registration",
      user.firstName
    );
    await sendEmail(mailOptions);

    return res.status(200).json(errors.REGISTRATION.VERIFICATION_RESENT);
  } catch (err) {
    console.error("Resend Verification Email error:", err);
    return res.status(500).json(errors.SERVER.ERROR);
  }
};

export const sendContactFormEmail = async (req, res) => {
  const payload = req.body?.data || req.body;
  const { yourName, yourEmail, subject, message } = payload || {};

  if (!yourName || !yourEmail || !subject || !message) {
    return res.status(400).json({
      code: "CNT003",
      message: "All fields (name, email, subject, message) are required.",
    });
  }

  try {
    const html = await ejs.renderFile(
      path.join(__dirname, "../templates/contactFormEmail.ejs"),
      { yourName, yourEmail, subject, message }
    );

    const mailOptions = {
      from: yourEmail,
      to: process.env.CONTACT_TO_EMAIL || "narrateja9699@gmail.com",
      subject: `New Contact Form Submission: ${subject}`,
      html,
    };

    await sendEmail(mailOptions);

    return res.status(200).json({
      code: "CNT004",
      message:
        "Your message has been sent successfully. We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact Form Email error:", error);
    return res.status(500).json({
      code: "CNT005",
      message: "Failed to send your message. Please try again later.",
    });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      code: "PWD001",
      message: "Current password and new password are required.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user)
      return res.status(404).json({
        code: "PWD002",
        message: "User not found.",
      });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({
        code: "PWD003",
        message: "Current password is incorrect.",
      });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res
      .status(200)
      .json({ code: "PWD004", message: "Password updated successfully." });
  } catch (err) {
    console.error("Change Password error:", err);
    return res.status(500).json({
      code: "PWD005",
      message: "An error occurred while updating the password.",
    });
  }
};

export default {
  registerUser,
  verifyRegistrationCode,
  loginUser,
  forgotPassword,
  verifyVerificationCode,
  resendVerificationEmail,
  sendContactFormEmail,
  changePassword,
  googleLogin,
};
