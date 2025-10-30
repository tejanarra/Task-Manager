// Auth Middleware Tests
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import authenticateToken from '../../middleware/authMiddleware.js';
import { generateToken } from '../../utils/tokenUtils.js';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key';
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  test('should call next() with valid token', async () => {
    const userId = 123;
    const token = generateToken(userId);
    req.header.mockReturnValue(`Bearer ${token}`);

    await authenticateToken(req, res, next);

    expect(req.userId).toBe(userId);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 401 when no token provided', async () => {
    req.header.mockReturnValue(null);

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 when token missing Bearer prefix', async () => {
    const token = generateToken(123);
    req.header.mockReturnValue(token); // No "Bearer " prefix

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 403 with invalid token', async () => {
    req.header.mockReturnValue('Bearer invalid.token.here');

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 403 with expired token', async () => {
    const expiredToken = generateToken(123, '1ms');
    await new Promise(resolve => setTimeout(resolve, 10));
    req.header.mockReturnValue(`Bearer ${expiredToken}`);

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
