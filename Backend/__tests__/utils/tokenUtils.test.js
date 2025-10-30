// Token Utils Tests
import { describe, test, expect, beforeAll } from '@jest/globals';
import {
  generateToken,
  verifyToken,
  decodeToken,
  extractTokenFromHeader,
  isTokenExpired,
} from '../../utils/tokenUtils.js';

describe('Token Utils', () => {
  let validToken;
  const testUserId = 123;

  beforeAll(() => {
    // Ensure JWT_SECRET is set for tests
    process.env.JWT_SECRET = 'test-secret-key-for-testing';
    validToken = generateToken(testUserId);
  });

  describe('generateToken', () => {
    test('should generate a valid JWT token', () => {
      const token = generateToken(testUserId);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format
    });

    test('should generate different tokens for different users', () => {
      const token1 = generateToken(1);
      const token2 = generateToken(2);
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token', async () => {
      const decoded = await verifyToken(validToken);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUserId);
    });

    test('should reject invalid token', async () => {
      await expect(verifyToken('invalid.token.here')).rejects.toThrow();
    });

    test('should reject expired token', async () => {
      // Generate token that expires immediately
      const expiredToken = generateToken(testUserId, '1ms');
      await new Promise(resolve => setTimeout(resolve, 10)); // Wait for expiry
      await expect(verifyToken(expiredToken)).rejects.toThrow();
    });
  });

  describe('decodeToken', () => {
    test('should decode valid token without verification', () => {
      const decoded = decodeToken(validToken);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUserId);
    });

    test('should return null for invalid token', () => {
      const decoded = decodeToken('invalid.token');
      expect(decoded).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    test('should extract token from valid Bearer header', () => {
      const header = `Bearer ${validToken}`;
      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(validToken);
    });

    test('should return null for missing Bearer prefix', () => {
      const extracted = extractTokenFromHeader(validToken);
      expect(extracted).toBeNull();
    });

    test('should return null for empty header', () => {
      expect(extractTokenFromHeader('')).toBeNull();
      expect(extractTokenFromHeader(null)).toBeNull();
      expect(extractTokenFromHeader(undefined)).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    test('should return false for valid token', () => {
      const token = generateToken(testUserId, '1h');
      expect(isTokenExpired(token)).toBe(false);
    });

    test('should return true for expired token', () => {
      // Create token with past expiry
      const expiredToken = generateToken(testUserId, '1ms');
      // Wait a bit to ensure expiration
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(isTokenExpired(expiredToken)).toBe(true);
          resolve();
        }, 10);
      });
    });

    test('should return true for invalid token', () => {
      expect(isTokenExpired('invalid.token')).toBe(true);
    });
  });
});
