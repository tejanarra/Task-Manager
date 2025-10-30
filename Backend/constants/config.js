// Backend Configuration Constants
// Centralized constants to avoid duplication and magic numbers

// Authentication Configuration
export const AUTH_CONFIG = {
  VERIFICATION_CODE_EXPIRY_MS: 600000, // 10 minutes
  BCRYPT_SALT_ROUNDS: 10,
  VERIFICATION_CODE_LENGTH: 6,
  PASSWORD_MIN_LENGTH: 8,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '48h',
};

// Task Configuration
export const TASK_CONFIG = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  DEFAULT_PRIORITY: 1,
  DEFAULT_STATUS: 'not-started',
  VALID_STATUSES: ['not-started', 'in-progress', 'completed'],
};

// AI Configuration
export const AI_CONFIG = {
  MODEL: 'deepseek-v3.1:671b-cloud',
  MAX_PROMPT_LENGTH: 500,
  LLM_TEMPERATURE: 0.7,
  LLM_TOP_P: 0.9,
  LLM_TOP_K: 50,
  MAX_TOKENS: 500,
  CONVERSATION_HISTORY_LIMIT: 6, // Max messages in history
  TASK_CONTEXT_LIMIT: 5, // Max recent tasks to load for context
  REMINDER_HOURS: {
    ONE_HOUR: 1,
    ONE_DAY: 24,
    ONE_WEEK: 168,
  },
};

// Email Configuration
export const EMAIL_CONFIG = {
  CONTACT_RECIPIENT: process.env.CONTACT_EMAIL || 'support@taskmanager.com',
  FRONTEND_BASE_URL: process.env.FRONTEND_URL || 'https://tejanarra.github.io/Task-Manager',
  FRONTEND_LOGIN_URL: process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/login`
    : 'https://tejanarra.github.io/Task-Manager/login',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 465,
  SMTP_SECURE: true,
};

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  FOLDER: 'avatars',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'gif'],
  TRANSFORMATION: {
    width: 500,
    height: 500,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  },
};

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: {
    AUTH: 5, // 5 attempts per 15 minutes
    API: 100, // 100 requests per 15 minutes
    AI: 20, // 20 AI requests per 15 minutes
  },
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
};

// Cron Job Configuration
export const CRON_CONFIG = {
  REMINDER_CHECK_INTERVAL: '*/5 * * * *', // Every 5 minutes
  REMINDER_BUFFER_MINUTES: 5, // Send reminders 5 minutes early
};

// Validation Configuration
export const VALIDATION_CONFIG = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9\-+()\s]*$/,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_NOT_VERIFIED: 'Account not verified. Please check your email',
  VERIFICATION_CODE_EXPIRED: 'Verification code has expired',
  VERIFICATION_CODE_INVALID: 'Invalid verification code',
  USER_ALREADY_EXISTS: 'User already exists with this email',
  USER_NOT_FOUND: 'User not found',

  // Authorization
  TOKEN_REQUIRED: 'Authentication token is required',
  TOKEN_INVALID: 'Invalid or expired authentication token',

  // Validation
  REQUIRED_FIELDS_MISSING: 'Please provide all required fields',
  INVALID_EMAIL: 'Please provide a valid email address',
  PASSWORD_TOO_SHORT: `Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters`,
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',

  // Tasks
  TASK_NOT_FOUND: 'Task not found',
  INVALID_TASK_STATUS: 'Invalid task status',
  INVALID_PRIORITY: 'Invalid priority value',

  // General
  SERVER_ERROR: 'An error occurred. Please try again later',
  NETWORK_ERROR: 'Network error. Please check your connection',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful! Please check your email for verification code',
  VERIFICATION_SUCCESS: 'Account verified successfully',
  LOGIN_SUCCESS: 'Login successful',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  TASK_CREATE_SUCCESS: 'Task created successfully',
  TASK_UPDATE_SUCCESS: 'Task updated successfully',
  TASK_DELETE_SUCCESS: 'Task deleted successfully',
  EMAIL_SENT_SUCCESS: 'Email sent successfully',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Database Configuration
export const DB_CONFIG = {
  POOL_MAX: 5,
  POOL_MIN: 0,
  POOL_ACQUIRE: 30000,
  POOL_IDLE: 10000,
  LOGGING: process.env.NODE_ENV === 'development',
};

// Environment Variables Validation
export const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'GOOGLE_CLIENT_ID',
  'OLLAMA_API_BASE_URL',
];
