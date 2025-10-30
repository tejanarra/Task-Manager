// Email Utility Functions
// Centralized email verification code generation and email setup

import crypto from 'crypto';
import path from 'path';
import ejs from 'ejs';
import { sendEmail } from './mailer.js';
import { AUTH_CONFIG, EMAIL_CONFIG } from '../constants/config.js';

/**
 * Generate a random verification code
 * @param {number} length - Length of code (default from config)
 * @returns {string} - Verification code
 */
export const generateVerificationCode = (length = AUTH_CONFIG.VERIFICATION_CODE_LENGTH) => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Calculate verification code expiration time
 * @returns {Date} - Expiration time
 */
export const getVerificationExpiration = () => {
  return new Date(Date.now() + AUTH_CONFIG.VERIFICATION_CODE_EXPIRY_MS);
};

/**
 * Check if verification code is expired
 * @param {Date} expirationDate - Expiration date from database
 * @returns {boolean} - True if expired
 */
export const isVerificationExpired = (expirationDate) => {
  return new Date() > new Date(expirationDate);
};

/**
 * Create verification email options
 * @param {string} email - Recipient email
 * @param {string} code - Verification code
 * @param {string} type - Email type ('registration' or 'password-reset')
 * @param {string} userName - User's first name (optional)
 * @returns {Promise<Object>} - Email options for nodemailer
 */
export const createVerificationEmail = async (email, code, type, userName = '') => {
  const templatePath = path.join(process.cwd(), 'templates', 'verificationEmail.ejs');

  const subject =
    type === 'registration'
      ? 'Verify Your Account - Task Manager'
      : 'Reset Your Password - Task Manager';

  const message =
    type === 'registration'
      ? 'Thank you for registering! Please verify your email address to activate your account.'
      : 'You requested to reset your password. Use the verification code below to proceed.';

  const htmlContent = await ejs.renderFile(templatePath, {
    userName: userName || 'User',
    verificationCode: code,
    message,
    loginUrl: EMAIL_CONFIG.FRONTEND_LOGIN_URL,
    expiryMinutes: Math.floor(AUTH_CONFIG.VERIFICATION_CODE_EXPIRY_MS / 60000),
  });

  return {
    to: email,
    subject,
    html: htmlContent,
  };
};

/**
 * Send verification email (combines generation and sending)
 * @param {string} email - Recipient email
 * @param {string} type - Email type ('registration' or 'password-reset')
 * @param {string} userName - User's first name (optional)
 * @returns {Promise<Object>} - { code: string, expiration: Date }
 */
export const sendVerificationEmail = async (email, type, userName = '') => {
  const code = generateVerificationCode();
  const expiration = getVerificationExpiration();

  const mailOptions = await createVerificationEmail(email, code, type, userName);
  await sendEmail(mailOptions);

  return { code, expiration };
};

/**
 * Create task reminder email options
 * @param {string} email - Recipient email
 * @param {Object} task - Task object
 * @param {string} reminderTime - Human-readable reminder time
 * @returns {Promise<Object>} - Email options for nodemailer
 */
export const createReminderEmail = async (email, task, reminderTime) => {
  const templatePath = path.join(process.cwd(), 'templates', 'taskReminder.ejs');

  const htmlContent = await ejs.renderFile(templatePath, {
    taskTitle: task.title,
    taskDescription: task.description || 'No description provided',
    deadline: new Date(task.deadline).toLocaleString(),
    reminderTime,
    taskUrl: `${EMAIL_CONFIG.FRONTEND_BASE_URL}/tasks/${task.id}/edit`,
  });

  return {
    to: email,
    subject: `Task Reminder: ${task.title}`,
    html: htmlContent,
  };
};

/**
 * Send task reminder email
 * @param {string} email - Recipient email
 * @param {Object} task - Task object
 * @param {string} reminderTime - Human-readable reminder time
 * @returns {Promise<void>}
 */
export const sendReminderEmail = async (email, task, reminderTime) => {
  const mailOptions = await createReminderEmail(email, task, reminderTime);
  await sendEmail(mailOptions);
};

/**
 * Create contact form email options
 * @param {Object} formData - Form data { name, email, subject, message }
 * @returns {Promise<Object>} - Email options for nodemailer
 */
export const createContactEmail = async (formData) => {
  const templatePath = path.join(process.cwd(), 'templates', 'contactFormEmail.ejs');

  const htmlContent = await ejs.renderFile(templatePath, {
    name: formData.name,
    email: formData.email,
    subject: formData.subject,
    message: formData.message,
  });

  return {
    to: EMAIL_CONFIG.CONTACT_RECIPIENT,
    subject: `Contact Form: ${formData.subject}`,
    html: htmlContent,
    replyTo: formData.email,
  };
};

/**
 * Send contact form email
 * @param {Object} formData - Form data { name, email, subject, message }
 * @returns {Promise<void>}
 */
export const sendContactEmail = async (formData) => {
  const mailOptions = await createContactEmail(formData);
  await sendEmail(mailOptions);
};
