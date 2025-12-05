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
 * Creates a one-time reminder from hours before deadline
 * @param {number} hoursBeforeDeadline - Hours before deadline
 * @param {Date|string} deadline - Task deadline
 * @returns {Object|null} - Reminder object
 */
export const createOneTimeReminder = (hoursBeforeDeadline, deadline) => {
  if (typeof hoursBeforeDeadline !== "number" || hoursBeforeDeadline <= 0 || !deadline) {
    return null;
  }

  const deadlineDate = new Date(deadline);
  const remindAt = new Date(deadlineDate.getTime() - hoursBeforeDeadline * 60 * 60 * 1000);
  const now = new Date();

  if (remindAt <= now) return null;

  return {
    type: REMINDER_TYPES.ONE_TIME,
    remindAt: remindAt.toISOString(),
    sent: false,
    lastSentAt: null,
  };
};

/**
 * Creates a one-time reminder from a custom date
 * @param {Date|string} customDate - Custom reminder date
 * @param {Date|string} deadline - Task deadline
 * @returns {Object|null} - Reminder object
 */
export const createOneTimeReminderFromDate = (customDate, deadline) => {
  if (!customDate || !deadline) return null;

  const remindDate = new Date(customDate);
  const deadlineDate = new Date(deadline);
  const now = new Date();

  if (isNaN(remindDate.getTime()) || isNaN(deadlineDate.getTime())) return null;
  if (remindDate <= now) return null;
  if (remindDate >= deadlineDate) return null;

  return {
    type: REMINDER_TYPES.ONE_TIME,
    remindAt: remindDate.toISOString(),
    sent: false,
    lastSentAt: null,
  };
};

/**
 * Creates a recurring reminder (daily or weekly)
 * @param {string} type - 'daily' or 'weekly'
 * @param {Date|string} deadline - Task deadline
 * @returns {Object|null} - Reminder object
 */
export const createRecurringReminder = (type, deadline) => {
  if (!deadline) return null;
  if (type !== REMINDER_TYPES.DAILY && type !== REMINDER_TYPES.WEEKLY) return null;

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const hoursUntilDeadline = (deadlineDate - now) / (1000 * 60 * 60);

  const intervalHours = type === REMINDER_TYPES.DAILY ? 24 : 168;
  if (hoursUntilDeadline < intervalHours) return null;

  return {
    type,
    intervalHours,
    sent: false,
    lastSentAt: null,
  };
};

/**
 * Normalizes reminders before saving to backend
 * Converts frontend format to standardized backend format
 * @param {Array} reminders - List of reminder objects
 * @param {string|Date} deadline - Task deadline
 * @returns {Array} - Normalized reminders
 */
export const normalizeRemindersBeforeSave = (reminders, deadline) => {
  if (!Array.isArray(reminders) || !deadline) return [];

  const normalized = [];
  const seen = new Set();

  for (const reminder of reminders) {
    if (!reminder || typeof reminder !== "object") continue;

    const { type, remindAt, remindBefore, customDate, intervalHours } = reminder;

    // Handle recurring reminders
    if (type === REMINDER_TYPES.DAILY || type === REMINDER_TYPES.WEEKLY) {
      const key = `recurring-${type}`;
      if (seen.has(key)) continue;

      const recurring = createRecurringReminder(type, deadline);
      if (recurring) {
        normalized.push(recurring);
        seen.add(key);
      }
      continue;
    }

    // Handle one-time reminders
    let oneTime = null;

    // Priority 1: Already has remindAt (new format)
    if (remindAt) {
      oneTime = createOneTimeReminderFromDate(remindAt, deadline);
    }
    // Priority 2: Has customDate
    else if (customDate) {
      oneTime = createOneTimeReminderFromDate(customDate, deadline);
    }
    // Priority 3: Has remindBefore (legacy format)
    else if (typeof remindBefore === "number" && remindBefore > 0) {
      oneTime = createOneTimeReminder(remindBefore, deadline);
    }

    if (oneTime) {
      const key = `onetime-${oneTime.remindAt}`;
      if (!seen.has(key)) {
        normalized.push(oneTime);
        seen.add(key);
      }
    }
  }

  return normalized;
};

/**
 * Gets reminder summary for display
 * @param {Array} reminders - Array of reminder objects
 * @param {Date|string} deadline - Task deadline for calculating hours
 * @returns {string} - Summary text (e.g., "1 hr, 1 day before")
 */
export const getReminderSummary = (reminders, deadline = null) => {
  if (!reminders || reminders.length === 0) return "";

  const parts = [];
  let oneTimeCount = 0;
  let hasDaily = false;
  let hasWeekly = false;

  for (const reminder of reminders) {
    if (!reminder) continue;

    if (reminder.type === REMINDER_TYPES.ONE_TIME) {
      oneTimeCount++;
    } else if (reminder.type === REMINDER_TYPES.DAILY) {
      hasDaily = true;
    } else if (reminder.type === REMINDER_TYPES.WEEKLY) {
      hasWeekly = true;
    }
  }

  if (oneTimeCount > 0) {
    parts.push(`${oneTimeCount} reminder${oneTimeCount > 1 ? 's' : ''}`);
  }
  if (hasDaily) parts.push("Daily");
  if (hasWeekly) parts.push("Weekly");

  return parts.join(", ");
};

/**
 * Adds or removes a recurring reminder (daily or weekly)
 * @param {Array} currentReminders - Current reminder array
 * @param {string} type - "daily" or "weekly"
 * @param {boolean} enabled - Whether to enable or disable
 * @param {Date|string} deadline - Deadline date
 * @returns {Array} - Updated reminders array
 */
export const toggleRecurringReminder = (
  currentReminders,
  type,
  enabled,
  deadline
) => {
  // Remove existing reminders of this type
  const filtered = currentReminders.filter((r) => r.type !== type);

  if (!enabled) {
    return filtered; // Just remove it
  }

  // Add a single recurring reminder
  const recurring = createRecurringReminder(type, deadline);
  if (recurring) {
    return [...filtered, recurring];
  }

  return filtered;
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
