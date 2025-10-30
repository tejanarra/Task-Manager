// Validation Utility Functions
// Centralized input validation and sanitization

import { VALIDATION_CONFIG, TASK_CONFIG } from '../constants/config.js';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_CONFIG.EMAIL_REGEX.test(email.trim());
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // Phone is optional
  return VALIDATION_CONFIG.PHONE_REGEX.test(phone);
};

/**
 * Validate name (first name or last name)
 * @param {string} name - Name to validate
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < VALIDATION_CONFIG.NAME_MIN_LENGTH) {
    return { valid: false, error: 'Name is required' };
  }

  if (trimmedName.length > VALIDATION_CONFIG.NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Name must be less than ${VALIDATION_CONFIG.NAME_MAX_LENGTH} characters`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate task status
 * @param {string} status - Status to validate
 * @returns {boolean} - True if valid
 */
export const isValidTaskStatus = (status) => {
  return TASK_CONFIG.VALID_STATUSES.includes(status);
};

/**
 * Validate task title
 * @param {string} title - Title to validate
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export const validateTaskTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Title is required' };
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0) {
    return { valid: false, error: 'Title is required' };
  }

  if (trimmedTitle.length > TASK_CONFIG.MAX_TITLE_LENGTH) {
    return {
      valid: false,
      error: `Title must be less than ${TASK_CONFIG.MAX_TITLE_LENGTH} characters`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate task description
 * @param {string} description - Description to validate
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export const validateTaskDescription = (description) => {
  if (!description) return { valid: true, error: null }; // Description is optional

  if (typeof description !== 'string') {
    return { valid: false, error: 'Description must be a string' };
  }

  if (description.length > TASK_CONFIG.MAX_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      error: `Description must be less than ${TASK_CONFIG.MAX_DESCRIPTION_LENGTH} characters`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Validate date is in the future
 * @param {Date|string} date - Date to validate
 * @returns {boolean} - True if in future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  return new Date(date) > new Date();
};

/**
 * Validate date is in the past
 * @param {Date|string} date - Date to validate
 * @returns {boolean} - True if in past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

/**
 * Sanitize string input (remove HTML, scripts, etc.)
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeString = (input) => {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove angle brackets
};

/**
 * Validate priority value
 * @param {number} priority - Priority to validate
 * @returns {boolean} - True if valid
 */
export const isValidPriority = (priority) => {
  return Number.isInteger(priority) && priority >= 1;
};

/**
 * Validate required fields are present
 * @param {Object} data - Data object
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} - { valid: boolean, missingFields: Array<string> }
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Validate bio length
 * @param {string} bio - Bio to validate
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export const validateBio = (bio) => {
  if (!bio) return { valid: true, error: null }; // Bio is optional

  if (typeof bio !== 'string') {
    return { valid: false, error: 'Bio must be a string' };
  }

  if (bio.length > VALIDATION_CONFIG.BIO_MAX_LENGTH) {
    return {
      valid: false,
      error: `Bio must be less than ${VALIDATION_CONFIG.BIO_MAX_LENGTH} characters`,
    };
  }

  return { valid: true, error: null };
};
