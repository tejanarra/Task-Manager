// Authentication Middleware
// Verifies JWT token and attaches userId to request

import dotenv from 'dotenv';
import { verifyToken, extractTokenFromHeader } from '../utils/tokenUtils.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/config.js';

dotenv.config();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: ERROR_MESSAGES.TOKEN_REQUIRED,
    });
  }

  try {
    const decoded = await verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Error verifying token:', err.message || err);
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      message: ERROR_MESSAGES.TOKEN_INVALID,
    });
  }
};

export default authenticateToken;
