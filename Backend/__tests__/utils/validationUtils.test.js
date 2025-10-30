// Validation Utils Tests
import { describe, test, expect } from '@jest/globals';
import {
  isValidEmail,
  isValidPhone,
  validateName,
  isValidTaskStatus,
  validateTaskTitle,
  validateTaskDescription,
  isValidPriority,
  validateRequiredFields,
  validateBio,
} from '../../utils/validationUtils.js';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    test('should validate correct email', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
    });

    test('should reject invalid email', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    test('should validate correct phone numbers', () => {
      expect(isValidPhone('+1 555-123-4567')).toBe(true);
      expect(isValidPhone('(555) 123-4567')).toBe(true);
      expect(isValidPhone('5551234567')).toBe(true);
    });

    test('should accept empty phone (optional)', () => {
      expect(isValidPhone('')).toBe(true);
      expect(isValidPhone(null)).toBe(true);
    });

    test('should reject phone with invalid characters', () => {
      expect(isValidPhone('555-abc-1234')).toBe(false);
    });
  });

  describe('validateName', () => {
    test('should validate correct names', () => {
      const result = validateName('John');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should reject empty names', () => {
      const result = validateName('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Name is required');
    });

    test('should reject names that are too long', () => {
      const longName = 'a'.repeat(51);
      const result = validateName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('less than');
    });

    test('should reject null/undefined names', () => {
      expect(validateName(null).valid).toBe(false);
      expect(validateName(undefined).valid).toBe(false);
    });
  });

  describe('isValidTaskStatus', () => {
    test('should validate correct statuses', () => {
      expect(isValidTaskStatus('not-started')).toBe(true);
      expect(isValidTaskStatus('in-progress')).toBe(true);
      expect(isValidTaskStatus('completed')).toBe(true);
    });

    test('should reject invalid statuses', () => {
      expect(isValidTaskStatus('invalid')).toBe(false);
      expect(isValidTaskStatus('COMPLETED')).toBe(false);
      expect(isValidTaskStatus('')).toBe(false);
    });
  });

  describe('validateTaskTitle', () => {
    test('should validate correct titles', () => {
      const result = validateTaskTitle('Complete project report');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should reject empty titles', () => {
      const result = validateTaskTitle('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    test('should reject titles that are too long', () => {
      const longTitle = 'a'.repeat(101);
      const result = validateTaskTitle(longTitle);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('less than');
    });
  });

  describe('validateTaskDescription', () => {
    test('should validate correct descriptions', () => {
      const result = validateTaskDescription('This is a task description');
      expect(result.valid).toBe(true);
    });

    test('should accept empty description (optional)', () => {
      const result = validateTaskDescription('');
      expect(result.valid).toBe(true);
    });

    test('should reject descriptions that are too long', () => {
      const longDesc = 'a'.repeat(1001);
      const result = validateTaskDescription(longDesc);
      expect(result.valid).toBe(false);
    });

    test('should reject non-string descriptions', () => {
      const result = validateTaskDescription(123);
      expect(result.valid).toBe(false);
    });
  });

  describe('isValidPriority', () => {
    test('should validate correct priorities', () => {
      expect(isValidPriority(1)).toBe(true);
      expect(isValidPriority(5)).toBe(true);
      expect(isValidPriority(100)).toBe(true);
    });

    test('should reject invalid priorities', () => {
      expect(isValidPriority(0)).toBe(false);
      expect(isValidPriority(-1)).toBe(false);
      expect(isValidPriority(1.5)).toBe(false);
      expect(isValidPriority('1')).toBe(false);
    });
  });

  describe('validateRequiredFields', () => {
    test('should pass when all required fields present', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 };
      const result = validateRequiredFields(data, ['name', 'email']);
      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    test('should fail when required fields missing', () => {
      const data = { name: 'John' };
      const result = validateRequiredFields(data, ['name', 'email', 'age']);
      expect(result.valid).toBe(false);
      expect(result.missingFields).toEqual(['email', 'age']);
    });

    test('should detect empty string as missing', () => {
      const data = { name: '', email: 'test@example.com' };
      const result = validateRequiredFields(data, ['name', 'email']);
      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('name');
    });
  });

  describe('validateBio', () => {
    test('should validate correct bio', () => {
      const result = validateBio('I am a software developer');
      expect(result.valid).toBe(true);
    });

    test('should accept empty bio (optional)', () => {
      const result = validateBio('');
      expect(result.valid).toBe(true);
    });

    test('should reject bio that is too long', () => {
      const longBio = 'a'.repeat(501);
      const result = validateBio(longBio);
      expect(result.valid).toBe(false);
    });

    test('should reject non-string bio', () => {
      const result = validateBio(123);
      expect(result.valid).toBe(false);
    });
  });
});
