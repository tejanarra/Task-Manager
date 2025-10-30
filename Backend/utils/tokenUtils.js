// JWT Token Utility Functions
// Centralized token generation and verification

import jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from '../constants/config.js';

/**
 * Generate a JWT token for a user
 * @param {number} userId - User ID to encode in token
 * @param {string} expiresIn - Token expiration (default from config)
 * @returns {string} - JWT token
 */
export const generateToken = (userId, expiresIn = AUTH_CONFIG.JWT_EXPIRATION) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
export const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

/**
 * Decode a JWT token without verification (use with caution)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} - Decoded token payload or null
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Check if a token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
};
