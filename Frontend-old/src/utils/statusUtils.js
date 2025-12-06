import { TASK_STATUS, STATUS_COLORS, TASK_STATUS_LABELS } from "../constants/appConstants";

/**
 * Gets the color for a task status
 * @param {string} status - The task status
 * @returns {string} - The hex color code
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS[TASK_STATUS.NOT_STARTED];
};

/**
 * Gets the label for a task status
 * @param {string} status - The task status
 * @returns {string} - The human-readable label
 */
export const getStatusLabel = (status) => {
  return TASK_STATUS_LABELS[status] || TASK_STATUS_LABELS[TASK_STATUS.NOT_STARTED];
};

/**
 * Checks if a status is valid
 * @param {string} status - The status to check
 * @returns {boolean} - True if valid
 */
export const isValidStatus = (status) => {
  return Object.values(TASK_STATUS).includes(status);
};

/**
 * Gets all available statuses
 * @returns {Array} - Array of status objects with value and label
 */
export const getAllStatuses = () => {
  return Object.values(TASK_STATUS).map(status => ({
    value: status,
    label: getStatusLabel(status),
    color: getStatusColor(status),
  }));
};
