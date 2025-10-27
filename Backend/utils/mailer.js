import nodemailer from "nodemailer";
import dotenv from "dotenv";
import errors from "./errors.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", mailOptions.to);
  } catch (error) {
    console.error("Email failure:", error);
    throw new Error(errors.SERVER.ERROR.message);
  }
};
