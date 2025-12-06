import { ERROR_MESSAGES } from "../constants/appConstants";

/**
 * Extracts error message from API error response
 * @param {Error} error - The error object from API call
 * @param {string} defaultMessage - Default message if none found
 * @returns {string} - The error message to display
 */
export const getErrorMessage = (error, defaultMessage = ERROR_MESSAGES.GENERIC_ERROR) => {
  if (!error) return defaultMessage;

  // Check for response data message
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Check for response data error
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  // Check for error message
  if (error.message) {
    return error.message;
  }

  return defaultMessage;
};

/**
 * Checks if error is an authorization error (403)
 * @param {Error} error - The error object
 * @returns {boolean} - True if 403 error
 */
export const isAuthorizationError = (error) => {
  return error?.response?.status === 403 || error?.status === 403;
};

/**
 * Checks if error is an authentication error (401)
 * @param {Error} error - The error object
 * @returns {boolean} - True if 401 error
 */
export const isAuthenticationError = (error) => {
  return error?.response?.status === 401 || error?.status === 401;
};

/**
 * Checks if error is a validation error (400 or 422)
 * @param {Error} error - The error object
 * @returns {boolean} - True if validation error
 */
export const isValidationError = (error) => {
  const status = error?.response?.status || error?.status;
  return status === 400 || status === 422;
};

/**
 * Checks if error is a network error
 * @param {Error} error - The error object
 * @returns {boolean} - True if network error
 */
export const isNetworkError = (error) => {
  return error.message === "Network Error" || !error.response;
};

/**
 * Gets HTTP status code from error
 * @param {Error} error - The error object
 * @returns {number|null} - Status code or null
 */
export const getStatusCode = (error) => {
  return error?.response?.status || error?.status || null;
};

/**
 * Formats validation errors from API response
 * @param {Error} error - The error object
 * @returns {Object} - Object with field names as keys and error messages as values
 */
export const getValidationErrors = (error) => {
  if (!isValidationError(error)) return {};

  const errors = error?.response?.data?.errors || {};
  return errors;
};
