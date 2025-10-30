// Authentication Controller
// Handles user registration, login, password reset, and Google OAuth

import { Op } from 'sequelize';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import errors from '../utils/errors.js';
import { sendEmail } from '../utils/mailer.js';
import { hashPassword, comparePassword, validatePassword } from '../utils/passwordUtils.js';
import { generateToken } from '../utils/tokenUtils.js';
import {
  sendVerificationEmail,
  isVerificationExpired,
  sendContactEmail
} from '../utils/emailUtils.js';
import {
  isValidEmail,
  validateName,
  validateRequiredFields
} from '../utils/validationUtils.js';
import { AUTH_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from '../constants/config.js';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Google OAuth Login
 */
export const googleLogin = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'AUTH009',
      message: 'Authorization code is required.',
    });
  }

  try {
    const { tokens } = await client.getToken({
      code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, email_verified } = payload;

    let user = await User.findOne({ where: { email } });

    if (user && !user.avatar) {
      user.avatar = picture;
      await user.save();
    }

    if (!user) {
      user = await User.create({
        firstName: given_name,
        lastName: family_name,
        email,
        password: '',
        avatar: picture,
        isVerified: email_verified,
      });
    }

    const jwtToken = generateToken(user.id);

    return res.status(HTTP_STATUS.OK).json({
      code: 'AUTH010',
      message: 'Google login successful.',
      token: jwtToken,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Google login error:', err.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errors.SERVER.ERROR);
  }
};

/**
 * Register new user
 */
export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Validate required fields
  const requiredCheck = validateRequiredFields(req.body, ['firstName', 'lastName', 'email', 'password']);
  if (!requiredCheck.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'REG001',
      message: ERROR_MESSAGES.REQUIRED_FIELDS_MISSING,
      missingFields: requiredCheck.missingFields,
    });
  }

  // Validate name
  const firstNameValidation = validateName(firstName);
  if (!firstNameValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'REG002',
      message: firstNameValidation.error,
    });
  }

  const lastNameValidation = validateName(lastName);
  if (!lastNameValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'REG003',
      message: lastNameValidation.error,
    });
  }

  // Validate email
  if (!isValidEmail(email)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'REG004',
      message: ERROR_MESSAGES.INVALID_EMAIL,
    });
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'REG005',
      message: passwordValidation.error,
    });
  }

  try {
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }] },
    });

    if (existingUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errors.AUTH.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(password);

    // Send verification email and get code + expiration
    const { code, expiration } = await sendVerificationEmail(email, 'registration', firstName);

    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      verificationCode: code,
      verificationCodeExpiration: expiration,
      isVerified: false,
    });

    return res.status(HTTP_STATUS.OK).json(errors.REGISTRATION.VERIFICATION_SENT);
  } catch (err) {
    console.error('Registration error:', err.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errors.SERVER.ERROR);
  }
};

/**
 * Verify registration code
 */
export const verifyRegistrationCode = async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(errors.REGISTRATION.MISSING_VERIFICATION_DATA);
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
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errors.AUTH.INVALID_VERIFICATION_CODE);
    }

    user.verificationCode = null;
    user.verificationCodeExpiration = null;
    user.isVerified = true;
    await user.save();

    const token = generateToken(user.id);

    return res.status(HTTP_STATUS.OK).json({
      code: 'REG006',
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
    console.error('Verification error:', err.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errors.SERVER.ERROR);
  }
};

/**
 * Login user
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'AUTH007',
      message: 'Email and password are required.',
    });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errors.AUTH.INVALID_CREDENTIALS);
    }

    if (!user.isVerified) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errors.AUTH.USER_NOT_VERIFIED);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errors.AUTH.INVALID_CREDENTIALS);
    }

    const token = generateToken(user.id);

    return res.status(HTTP_STATUS.OK).json({
      code: 'AUTH008',
      message: 'Login successful.',
      token,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errors.SERVER.ERROR);
  }
};

/**
 * Forgot password - send verification code
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(errors.PASSWORD.MISSING_EMAIL);
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return res.status(HTTP_STATUS.OK).json(errors.PASSWORD.VERIFICATION_SENT);
    }

    const { code, expiration } = await sendVerificationEmail(email, 'password-reset', user.firstName);

    user.verificationCode = code;
    user.verificationCodeExpiration = expiration;
    await user.save();

    return res.status(HTTP_STATUS.OK).json(errors.PASSWORD.VERIFICATION_SENT);
  } catch (err) {
    console.error('Forgot Password error:', err.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errors.SERVER.ERROR);
  }
};

/**
 * Verify verification code and reset password
 */
export const verifyVerificationCode = async (req, res) => {
  const { email, verificationCode, newPassword } = req.body;

  if (!email || !verificationCode || !newPassword) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'PWD004',
      message: 'Email, verification code, and new password are required.',
    });
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'PWD006',
      message: passwordValidation.error,
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
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errors.AUTH.INVALID_VERIFICATION_CODE);
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.verificationCode = null;
    user.verificationCodeExpiration = null;
    await user.save();

    return res.status(HTTP_STATUS.OK).json({
      code: 'PWD005',
      message: 'Password successfully reset. You can now log in with your new password.',
    });
  } catch (err) {
    console.error('Verification Code error:', err.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errors.SERVER.ERROR);
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'REG005',
      message: 'Email is required to resend verification code.',
    });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return res.status(HTTP_STATUS.OK).json(errors.REGISTRATION.VERIFICATION_RESENT);
    }

    if (user.isVerified) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        code: 'REG006',
        message: 'User is already verified.',
      });
    }

    const { code, expiration } = await sendVerificationEmail(email, 'registration', user.firstName);

    user.verificationCode = code;
    user.verificationCodeExpiration = expiration;
    await user.save();

    return res.status(HTTP_STATUS.OK).json(errors.REGISTRATION.VERIFICATION_RESENT);
  } catch (err) {
    console.error('Resend Verification Email error:', err.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errors.SERVER.ERROR);
  }
};

/**
 * Send contact form email
 */
export const sendContactFormEmail = async (req, res) => {
  const { yourName, yourEmail, subject, message } = req.body.data;

  if (!yourName || !yourEmail || !subject || !message) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'CNT003',
      message: 'All fields (name, email, subject, message) are required.',
    });
  }

  try {
    await sendContactEmail({
      name: yourName,
      email: yourEmail,
      subject,
      message,
    });

    return res.status(HTTP_STATUS.OK).json({
      code: 'CNT004',
      message: 'Your message has been sent successfully. We will get back to you soon.',
    });
  } catch (error) {
    console.error('Contact Form Email error:', error.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      code: 'CNT005',
      message: 'Failed to send your message. Please try again later.',
    });
  }
};

/**
 * Change password (authenticated user)
 */
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  if (!currentPassword || !newPassword) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'PWD001',
      message: 'Current password and new password are required.',
    });
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      code: 'PWD007',
      message: passwordValidation.error,
    });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        code: 'PWD002',
        message: 'User not found.',
      });
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        code: 'PWD003',
        message: 'Current password is incorrect.',
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    await user.save();

    return res.status(HTTP_STATUS.OK).json({
      code: 'PWD004',
      message: 'Password updated successfully.',
    });
  } catch (err) {
    console.error('Change Password error:', err.message);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      code: 'PWD005',
      message: 'An error occurred while updating the password.',
    });
  }
};
