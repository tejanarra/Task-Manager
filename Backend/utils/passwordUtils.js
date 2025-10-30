// Password Utility Functions
// Centralized password hashing and comparison to avoid duplication

import bcrypt from 'bcryptjs';
import { AUTH_CONFIG } from '../constants/config.js';

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(AUTH_CONFIG.BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if passwords match
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Validate password meets minimum requirements
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters`,
    };
  }

  // Optional: Add more validation rules
  // - At least one uppercase letter
  // - At least one lowercase letter
  // - At least one number
  // - At least one special character

  return { valid: true, error: null };
};

/**
 * Generate a random password (useful for testing or OAuth users)
 * @param {number} length - Length of password (default: 16)
 * @returns {string} - Random password
 */
export const generateRandomPassword = (length = 16) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};
