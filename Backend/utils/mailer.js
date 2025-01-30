const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const errors = require("./errors");

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: true,
    logger: true,
  });

const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${mailOptions.to}`);
    return 100;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(errors.SERVER.EMAIL_SEND_FAILURE.message);
  }
};

module.exports = {
  sendEmail,
};
