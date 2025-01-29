const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const errors = require("./errors");

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
    console.log(`Email sent to ${mailOptions.to}`);
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(errors.SERVER.EMAIL_SEND_FAILURE.message);
  }
};

module.exports = {
  sendEmail,
};
