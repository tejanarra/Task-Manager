// Password Utils Tests
import { describe, test, expect } from '@jest/globals';
import {
  hashPassword,
  comparePassword,
  validatePassword,
  generateRandomPassword,
} from '../../utils/passwordUtils.js';

describe('Password Utils', () => {
  describe('hashPassword', () => {
    test('should hash a password', async () => {
      const password = 'TestPassword123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    test('should generate different hashes for same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Due to salt
    });
  });

  describe('comparePassword', () => {
    test('should return true for matching password', async () => {
      const password = 'TestPassword123';
      const hashed = await hashPassword(password);
      const result = await comparePassword(password, hashed);

      expect(result).toBe(true);
    });

    test('should return false for non-matching password', async () => {
      const password = 'TestPassword123';
      const hashed = await hashPassword(password);
      const result = await comparePassword('WrongPassword', hashed);

      expect(result).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('should validate password with minimum length', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should reject password too short', () => {
      const result = validatePassword('Pass1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least');
    });

    test('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Password is required');
    });

    test('should reject null password', () => {
      const result = validatePassword(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Password is required');
    });
  });

  describe('generateRandomPassword', () => {
    test('should generate password of default length', () => {
      const password = generateRandomPassword();
      expect(password.length).toBe(16);
    });

    test('should generate password of custom length', () => {
      const password = generateRandomPassword(12);
      expect(password.length).toBe(12);
    });

    test('should generate different passwords', () => {
      const pass1 = generateRandomPassword();
      const pass2 = generateRandomPassword();
      expect(pass1).not.toBe(pass2);
    });
  });
});
