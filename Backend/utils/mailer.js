// Email Service
// Centralized email sending using Nodemailer

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import errors from './errors.js';
import { EMAIL_CONFIG } from '../constants/config.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: EMAIL_CONFIG.SMTP_HOST,
  port: EMAIL_CONFIG.SMTP_PORT,
  secure: EMAIL_CONFIG.SMTP_SECURE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  debug: false,
  logger: false,
});

export const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      ...mailOptions,
    });
    console.log(`Email sent to ${mailOptions.to} successfully`);
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(errors.SERVER.EMAIL_SEND_FAILURE.message);
  }
};
