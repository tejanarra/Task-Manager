// Rate Limiting Middleware
// Prevents abuse by limiting requests per IP/user

import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_CONFIG, HTTP_STATUS } from '../constants/config.js';

/**
 * Rate limiter for authentication endpoints
 * More restrictive to prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS.AUTH,
  message: {
    error: 'Too many authentication attempts. Please try again later.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS || 429,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for general API endpoints
 * More lenient for normal operations
 */
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS.API,
  message: {
    error: 'Too many requests. Please try again later.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS || 429,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for AI endpoints
 * Moderate limits to prevent API abuse
 */
export const aiLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: RATE_LIMIT_CONFIG.MAX_REQUESTS.AI,
  message: {
    error: 'Too many AI requests. Please try again later.',
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS || 429,
  standardHeaders: true,
  legacyHeaders: false,
});
