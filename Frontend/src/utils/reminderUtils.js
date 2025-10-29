import { REMINDER_INTERVALS, REMINDER_TYPES, TIME_CONSTANTS } from "../constants/appConstants";

/**
 * Formats hours into human-readable label
 * @param {number} hours - Number of hours
 * @returns {string} - Formatted label (e.g., "1 hr", "2 days", "1 week")
 */
export const formatHoursLabel = (hours) => {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  }

  if (hours < TIME_CONSTANTS.ONE_DAY_HOURS) {
    const formattedHours = hours % 1 === 0 ? hours : hours.toFixed(1);
    return `${formattedHours} hr${hours !== 1 ? "s" : ""}`;
  }

  const days = hours / TIME_CONSTANTS.ONE_DAY_HOURS;
  if (days < 7) {
    const formattedDays = days % 1 === 0 ? days : days.toFixed(1);
    return `${formattedDays} day${days !== 1 ? "s" : ""}`;
  }

  const weeks = days / 7;
  const formattedWeeks = weeks % 1 === 0 ? weeks : weeks.toFixed(1);
  return `${formattedWeeks} week${weeks !== 1 ? "s" : ""}`;
};

/**
 * Normalize and calculate remindBefore for all reminders before saving
 * @param {Array} reminders - List of reminder objects
 * @param {string|Date} deadline - ISO string or Date for task deadline
 * @returns {Array} - Normalized reminders
 */
export const normalizeRemindersBeforeSave = (reminders, deadline) => {
  if (!Array.isArray(reminders) || !deadline) return reminders;

  const deadlineDate = new Date(deadline);

  return reminders.map((r) => {
    // Skip invalid dates or reminders with explicit remindBefore
    if (r.remindBefore && !r.customDate) return r;

    // If a customDate exists, calculate remindBefore dynamically
    if (r.customDate) {
      const customDate = new Date(r.customDate);
      if (!isNaN(customDate.getTime()) && customDate < deadlineDate) {
        const diffHours = (deadlineDate - customDate) / (1000 * 60 * 60);
        return { ...r, remindBefore: diffHours };
      }
    }

    // Fallback: keep as-is
    return r;
  });
};

/**
 * Gets reminder summary for display
 * @param {Array} reminders - Array of reminder objects
 * @returns {string} - Summary text (e.g., "1 hr, 1 day before")
 */
export const getReminderSummary = (reminders) => {
  if (!reminders || reminders.length === 0) return "";

  const oneTimeReminders = reminders.filter(
    (r) => !r.type || r.type === REMINDER_TYPES.ONE_TIME
  );

  const hasDailyReminders = reminders.some((r) => r.type === REMINDER_TYPES.DAILY);
  const hasWeeklyReminders = reminders.some((r) => r.type === REMINDER_TYPES.WEEKLY);

  const parts = [];

  // Add one-time reminders
  if (oneTimeReminders.length > 0) {
    const labels = oneTimeReminders
      .map((r) => formatHoursLabel(r.remindBefore))
      .join(", ");
    parts.push(labels);
  }

  // Add recurring reminders
  if (hasDailyReminders) parts.push("Daily");
  if (hasWeeklyReminders) parts.push("Weekly");

  return parts.join(", ");
};

/**
 * Regenerates recurring reminders (daily or weekly)
 * @param {Array} currentReminders - Current reminder array
 * @param {string} type - "daily" or "weekly"
 * @param {Date} deadlineDate - Deadline date
 * @param {Date} now - Current date
 * @returns {Array} - Updated reminders array
 */
export const regenerateRecurringReminders = (
  currentReminders,
  type,
  deadlineDate,
  now = new Date()
) => {
  // Remove existing reminders of this type
  const filtered = currentReminders.filter((r) => r.type !== type);

  const diffInHours = (deadlineDate - now) / (1000 * 60 * 60);

  if (type === REMINDER_TYPES.DAILY) {
    const days = Math.floor(diffInHours / TIME_CONSTANTS.ONE_DAY_HOURS);
    if (days < 1) return filtered;

    const newReminders = [];
    for (let i = 1; i <= days; i++) {
      newReminders.push({
        remindBefore: i * TIME_CONSTANTS.ONE_DAY_HOURS,
        sent: false,
        type: REMINDER_TYPES.DAILY,
        dayNumber: i,
      });
    }
    return [...filtered, ...newReminders];
  }

  if (type === REMINDER_TYPES.WEEKLY) {
    const weeks = Math.floor(diffInHours / TIME_CONSTANTS.ONE_WEEK_HOURS);
    if (weeks < 1) return filtered;

    const newReminders = [];
    for (let i = 1; i <= weeks; i++) {
      newReminders.push({
        remindBefore: i * TIME_CONSTANTS.ONE_WEEK_HOURS,
        sent: false,
        type: REMINDER_TYPES.WEEKLY,
        weekNumber: i,
      });
    }
    return [...filtered, ...newReminders];
  }

  return currentReminders;
};

/**
 * Checks if a reminder is one-time (not daily/weekly)
 * @param {Object} reminder - Reminder object
 * @returns {boolean} - True if one-time
 */
export const isOneTimeReminder = (reminder) => {
  return !reminder.type || reminder.type === REMINDER_TYPES.ONE_TIME;
};

/**
 * Gets count of active reminders
 * @param {Array} reminders - Array of reminder objects
 * @returns {number} - Count of active reminders
 */
export const getActiveReminderCount = (reminders) => {
  if (!reminders || !Array.isArray(reminders)) return 0;
  return reminders.filter((r) => !r.sent).length;
};

/**
 * Validates a custom reminder date
 * @param {string|Date} customDate - Custom reminder date
 * @param {string|Date} deadline - Task deadline
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateCustomReminder = (customDate, deadline) => {
  if (!customDate) {
    return { valid: false, error: "Please select a reminder date" };
  }

  const reminderDate = new Date(customDate);
  const deadlineDate = new Date(deadline);
  const now = new Date();

  if (isNaN(reminderDate.getTime())) {
    return { valid: false, error: "Invalid reminder date" };
  }

  if (reminderDate <= now) {
    return { valid: false, error: "Reminder must be in the future" };
  }

  if (reminderDate >= deadlineDate) {
    return { valid: false, error: "Reminder must be before deadline" };
  }

  return { valid: true, error: null };
};

/**
 * Gets reminder intervals for selection
 * @returns {Array} - Array of interval objects
 */
export const getReminderIntervals = () => {
  return REMINDER_INTERVALS;
};
