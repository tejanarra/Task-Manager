// Application Constants
// Centralized constants to avoid duplication across components

// Reminder Intervals
export const REMINDER_INTERVALS = [
  { value: 1, label: "1 hr" },
  { value: 24, label: "1 day" },
  { value: 168, label: "1 week" },
];

// Task Status Options
export const TASK_STATUS = {
  NOT_STARTED: "not-started",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.NOT_STARTED]: "Not Started",
  [TASK_STATUS.IN_PROGRESS]: "In Progress",
  [TASK_STATUS.COMPLETED]: "Completed",
};

// Status Colors
export const STATUS_COLORS = {
  [TASK_STATUS.COMPLETED]: "#007a00",
  [TASK_STATUS.IN_PROGRESS]: "#daa520",
  [TASK_STATUS.NOT_STARTED]: "#a00000",
};

// LocalStorage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER_INFO: "userInfo",
  THEME: "theme",
  AI_CHAT_MODE: "ai_chat_mode",
  AI_CHAT_HISTORY: "ai_chat_history",
};

// Date/Time Constants
export const TIME_CONSTANTS = {
  ONE_MINUTE_MS: 60 * 1000,
  ONE_HOUR_MS: 60 * 60 * 1000,
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  TWO_DAYS_MS: 48 * 60 * 60 * 1000,
  ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  ONE_HOUR_HOURS: 1,
  ONE_DAY_HOURS: 24,
  ONE_WEEK_HOURS: 168,
};

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  BASE_URL: process.env.REACT_APP_API_URL || "https://task-manager-sigma-ashen.vercel.app/api",
};

// AI Chat Suggestion Prompts
export const AI_SUGGESTIONS = [
  "Schedule dentist appointment next Tuesday at 3pm",
  "Plan weekend shopping with 1 day reminder",
  "Prepare presentation for Monday with daily reminders",
];

// Reminder Types
export const REMINDER_TYPES = {
  ONE_TIME: "one-time",
  DAILY: "daily",
  WEEKLY: "weekly",
};

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  PASSWORD_MISMATCH: "Passwords do not match",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  INVALID_PHONE: "Please enter a valid phone number",
};

// Error Messages
export const ERROR_MESSAGES = {
  LOGIN_FAILED: "Login failed. Please try again.",
  REGISTRATION_FAILED: "Registration failed. Please try again.",
  VERIFICATION_FAILED: "Verification failed. Please try again.",
  PASSWORD_RESET_FAILED: "Password reset failed. Please try again.",
  PASSWORD_CHANGE_FAILED: "Failed to change password. Please try again.",
  PROFILE_UPDATE_FAILED: "Failed to update profile. Please try again.",
  TASK_FETCH_FAILED: "Failed to fetch tasks. Please try again.",
  TASK_CREATE_FAILED: "Failed to create task. Please try again.",
  TASK_UPDATE_FAILED: "Failed to update task. Please try again.",
  TASK_DELETE_FAILED: "Failed to delete task. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  REGISTRATION_SUCCESS: "Registration successful!",
  PASSWORD_RESET_SUCCESS: "Password reset successful!",
  PASSWORD_CHANGE_SUCCESS: "Password changed successfully!",
  PROFILE_UPDATE_SUCCESS: "Profile updated successfully!",
  TASK_CREATE_SUCCESS: "Task created successfully!",
  TASK_UPDATE_SUCCESS: "Task updated successfully!",
  TASK_DELETE_SUCCESS: "Task deleted successfully!",
};

// Responsive Breakpoints
export const BREAKPOINTS = {
  MOBILE: 720,
  TABLET: 1024,
  DESKTOP: 1025,
};

// Avatar Configuration
export const AVATAR_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
  SCALE_MIN: 1,
  SCALE_MAX: 2,
  CROP_SIZE: { width: 200, height: 200 },
  QUALITY: 0.8,
};

// Drag and Drop Configuration
export const DND_CONFIG = {
  ACTIVATION_CONSTRAINT: { distance: 10 },
  TOUCH_DELAY: 200,
  TOUCH_TOLERANCE: 5,
};
