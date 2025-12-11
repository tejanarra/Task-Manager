// Simplified Reminder Helper Utilities
// Provides clean, reliable reminder handling with timezone awareness

import { DateTime } from "luxon";

/**
 * Reminder Types
 */
export const REMINDER_TYPE = {
  ONE_TIME: "one-time",
  DAILY: "daily",
  WEEKLY: "weekly",
};

/**
 * Validates a single reminder object
 * @param {Object} reminder - Reminder to validate
 * @param {Date|string} deadline - Task deadline
 * @returns {boolean} - Whether reminder is valid
 */
export const isValidReminder = (reminder, deadline) => {
  if (!reminder || typeof reminder !== "object") return false;
  if (!deadline) return false;

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) return false;

  const { type, remindAt, intervalHours } = reminder;

  // Validate type
  if (!Object.values(REMINDER_TYPE).includes(type)) return false;

  // One-time reminders must have remindAt
  if (type === REMINDER_TYPE.ONE_TIME) {
    if (!remindAt) return false;
    const remindDate = new Date(remindAt);
    if (isNaN(remindDate.getTime())) return false;
    if (remindDate >= deadlineDate) return false;
    if (remindDate < new Date()) return false;
    return true;
  }

  // Recurring reminders must have intervalHours
  if (type === REMINDER_TYPE.DAILY || type === REMINDER_TYPE.WEEKLY) {
    if (typeof intervalHours !== "number") return false;
    if (type === REMINDER_TYPE.DAILY && intervalHours !== 24) return false;
    if (type === REMINDER_TYPE.WEEKLY && intervalHours !== 168) return false;
    return true;
  }

  return false;
};

/**
 * Creates a one-time reminder from hours before deadline
 * @param {number} hoursBeforeDeadline - Hours before deadline to remind
 * @param {Date|string} deadline - Task deadline
 * @param {string} userTimeZone - User's timezone (e.g., 'America/New_York')
 * @returns {Object|null} - Reminder object or null if invalid
 */
export const createOneTimeReminder = (
  hoursBeforeDeadline,
  deadline,
  userTimeZone = "UTC"
) => {
  if (
    typeof hoursBeforeDeadline !== "number" ||
    hoursBeforeDeadline <= 0 ||
    !deadline
  ) {
    return null;
  }

  try {
    const deadlineDT = DateTime.fromISO(new Date(deadline).toISOString(), {
      zone: "utc",
    });
    const remindAtDT = deadlineDT.minus({ hours: hoursBeforeDeadline });
    const now = DateTime.now().setZone("utc");

    // Must be in the future
    if (remindAtDT <= now) return null;

    return {
      type: REMINDER_TYPE.ONE_TIME,
      remindAt: remindAtDT.toISO(),
      sent: false,
      lastSentAt: null,
    };
  } catch (error) {
    console.error("Error creating one-time reminder:", error);
    return null;
  }
};

/**
 * Creates a one-time reminder from custom date
 * @param {Date|string} customDate - Custom reminder date
 * @param {Date|string} deadline - Task deadline
 * @param {string} userTimeZone - User's timezone
 * @returns {Object|null} - Reminder object or null if invalid
 */
export const createOneTimeReminderFromDate = (
  customDate,
  deadline,
  userTimeZone = "UTC"
) => {
  if (!customDate || !deadline) return null;

  try {
    // Parse custom date in user's timezone
    const customDT = DateTime.fromISO(new Date(customDate).toISOString(), {
      zone: userTimeZone,
    });
    const deadlineDT = DateTime.fromISO(new Date(deadline).toISOString(), {
      zone: "utc",
    });
    const now = DateTime.now().setZone(userTimeZone);

    // Validate
    if (!customDT.isValid || !deadlineDT.isValid) return null;
    if (customDT <= now) return null;
    if (customDT.toUTC() >= deadlineDT) return null;

    return {
      type: REMINDER_TYPE.ONE_TIME,
      remindAt: customDT.toUTC().toISO(),
      sent: false,
      lastSentAt: null,
    };
  } catch (error) {
    console.error("Error creating reminder from custom date:", error);
    return null;
  }
};

/**
 * Creates a recurring reminder (daily or weekly)
 * @param {string} type - 'daily' or 'weekly'
 * @param {Date|string} deadline - Task deadline
 * @returns {Object|null} - Reminder object or null if invalid
 */
export const createRecurringReminder = (type, deadline) => {
  if (!deadline) return null;
  if (type !== REMINDER_TYPE.DAILY && type !== REMINDER_TYPE.WEEKLY) {
    return null;
  }

  try {
    const deadlineDT = DateTime.fromISO(new Date(deadline).toISOString(), {
      zone: "utc",
    });
    const now = DateTime.now().setZone("utc");
    const hoursUntilDeadline = deadlineDT.diff(now, "hours").hours;

    // Must have enough time for at least one reminder
    const intervalHours = type === REMINDER_TYPE.DAILY ? 24 : 168;
    if (hoursUntilDeadline < intervalHours) return null;

    return {
      type,
      intervalHours,
      sent: false,
      lastSentAt: null,
    };
  } catch (error) {
    console.error("Error creating recurring reminder:", error);
    return null;
  }
};

/**
 * Normalizes reminders from frontend format to backend format
 * Handles both old format (remindBefore) and new format (remindAt)
 * @param {Array} reminders - Array of reminder objects
 * @param {Date|string} deadline - Task deadline
 * @param {string} userTimeZone - User's timezone
 * @param {Date|string} oldDeadline - Previous deadline (optional, for updates)
 * @returns {Array} - Normalized reminders
 */
export const normalizeReminders = (reminders, deadline, userTimeZone = "UTC", oldDeadline = null) => {
  if (!Array.isArray(reminders) || !deadline) return [];

  // Check if deadline time-of-day changed
  let deadlineTimeChanged = false;
  if (oldDeadline && deadline) {
    try {
      const oldDT = DateTime.fromISO(new Date(oldDeadline).toISOString(), { zone: "utc" });
      const newDT = DateTime.fromISO(new Date(deadline).toISOString(), { zone: "utc" });
      // Compare hour and minute to see if time-of-day changed
      deadlineTimeChanged = oldDT.hour !== newDT.hour || oldDT.minute !== newDT.minute;
    } catch (error) {
      // If comparison fails, assume it changed to be safe
      deadlineTimeChanged = true;
    }
  }

  const normalized = [];
  const seen = new Set();

  for (const reminder of reminders) {
    if (!reminder || typeof reminder !== "object") continue;

    const { type, remindBefore, remindAt, customDate, intervalHours } = reminder;

    // Handle recurring reminders
    if (type === REMINDER_TYPE.DAILY || type === REMINDER_TYPE.WEEKLY) {
      const key = `recurring-${type}`;
      if (seen.has(key)) continue; // Only one of each type

      const recurring = createRecurringReminder(type, deadline);
      if (recurring) {
        // Preserve lastSentAt ONLY if deadline time didn't change
        if (!deadlineTimeChanged && reminder.lastSentAt) {
          recurring.lastSentAt = reminder.lastSentAt;
          recurring.sent = reminder.sent || false;
        }
        normalized.push(recurring);
        seen.add(key);
      }
      continue;
    }

    // Handle one-time reminders
    let oneTime = null;

    // Priority 1: Already has remindAt (new format)
    if (remindAt) {
      const remindDate = new Date(remindAt);
      if (!isNaN(remindDate.getTime())) {
        oneTime = {
          type: REMINDER_TYPE.ONE_TIME,
          remindAt: remindDate.toISOString(),
          sent: reminder.sent || false,
          lastSentAt: reminder.lastSentAt || null,
        };
      }
    }
    // Priority 2: Has customDate (user picked specific datetime)
    else if (customDate) {
      oneTime = createOneTimeReminderFromDate(customDate, deadline, userTimeZone);
    }
    // Priority 3: Has remindBefore (hours before deadline)
    else if (typeof remindBefore === "number" && remindBefore > 0) {
      oneTime = createOneTimeReminder(remindBefore, deadline, userTimeZone);
    }

    if (oneTime) {
      // Deduplicate by remindAt timestamp
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
 * Gets reminders that are ready to be sent
 * @param {Array} reminders - Array of reminder objects
 * @param {Date|string} deadline - Task deadline
 * @returns {Array} - Reminders that should be sent now
 */
export const getReadyReminders = (reminders, deadline) => {
  if (!Array.isArray(reminders) || !deadline) return [];

  const now = DateTime.now().setZone("utc");
  const deadlineDT = DateTime.fromISO(new Date(deadline).toISOString(), {
    zone: "utc",
  });
  const ready = [];

  for (const reminder of reminders) {
    if (!reminder || typeof reminder !== "object") continue;
    if (reminder.sent) continue; // Skip already sent

    const { type, remindAt, intervalHours, lastSentAt } = reminder;

    // One-time reminders
    if (type === REMINDER_TYPE.ONE_TIME && remindAt) {
      const remindAtDT = DateTime.fromISO(remindAt, { zone: "utc" });
      if (remindAtDT.isValid && now >= remindAtDT) {
        ready.push(reminder);
      }
    }

    // Recurring reminders (daily/weekly)
    if (
      (type === REMINDER_TYPE.DAILY || type === REMINDER_TYPE.WEEKLY) &&
      intervalHours
    ) {
      const hoursUntilDeadline = deadlineDT.diff(now, "hours").hours;

      // Check if we should send based on interval
      let shouldSend = false;

      if (!lastSentAt) {
        // First reminder: Check if we've reached the deadline time today
        // Calculate when today's reminder should be sent (same time as deadline)
        const deadlineTimeToday = deadlineDT.set({
          year: now.year,
          month: now.month,
          day: now.day,
        });

        // Send if we've reached or passed today's deadline time and the actual deadline hasn't passed
        shouldSend = now >= deadlineTimeToday && hoursUntilDeadline > 0;
      } else {
        // Subsequent reminders: send if interval has passed since last
        const lastSentDT = DateTime.fromISO(lastSentAt, { zone: "utc" });
        const hoursSinceLastSent = now.diff(lastSentDT, "hours").hours;

        // Also check if we're at or past the deadline time of day
        const deadlineTimeToday = deadlineDT.set({
          year: now.year,
          month: now.month,
          day: now.day,
        });

        const isAtOrPastDeadlineTime = now >= deadlineTimeToday;

        shouldSend =
          hoursSinceLastSent >= intervalHours &&
          isAtOrPastDeadlineTime &&
          hoursUntilDeadline > 0;
      }

      if (shouldSend) {
        ready.push(reminder);
      }
    }
  }

  return ready;
};

/**
 * Marks a reminder as sent
 * @param {Object} reminder - Reminder object
 * @returns {Object} - Updated reminder
 */
export const markReminderAsSent = (reminder) => {
  if (!reminder || typeof reminder !== "object") return reminder;

  const updated = { ...reminder };

  if (updated.type === REMINDER_TYPE.ONE_TIME) {
    // One-time reminders are marked as sent and won't fire again
    updated.sent = true;
    updated.lastSentAt = new Date().toISOString();
  } else if (
    updated.type === REMINDER_TYPE.DAILY ||
    updated.type === REMINDER_TYPE.WEEKLY
  ) {
    // Recurring reminders update lastSentAt but remain active
    updated.lastSentAt = new Date().toISOString();
    // Don't mark as sent - they can fire multiple times
  }

  return updated;
};

/**
 * Converts new reminder format to legacy format for backward compatibility
 * @param {Array} reminders - Array of new-format reminders
 * @param {Date|string} deadline - Task deadline
 * @returns {Array} - Legacy format reminders
 */
export const toLegacyFormat = (reminders, deadline) => {
  if (!Array.isArray(reminders) || !deadline) return [];

  const deadlineDate = new Date(deadline);
  return reminders.map((reminder) => {
    const { type, remindAt, intervalHours, sent, lastSentAt } = reminder;

    const legacy = { type, sent: sent || false };

    if (type === REMINDER_TYPE.ONE_TIME && remindAt) {
      const remindDate = new Date(remindAt);
      const diffMs = deadlineDate - remindDate;
      const diffHours = diffMs / (1000 * 60 * 60);
      legacy.remindBefore = diffHours;
      legacy.customDate = remindAt;
    } else if (type === REMINDER_TYPE.DAILY) {
      legacy.remindBefore = 24;
    } else if (type === REMINDER_TYPE.WEEKLY) {
      legacy.remindBefore = 168;
    }

    return legacy;
  });
};

/**
 * Calculates summary of reminders for display
 * @param {Array} reminders - Array of reminder objects
 * @returns {string} - Summary text
 */
export const getReminderSummary = (reminders) => {
  if (!Array.isArray(reminders) || reminders.length === 0) return "";

  const parts = [];
  let oneTimeCount = 0;
  let hasDaily = false;
  let hasWeekly = false;

  for (const reminder of reminders) {
    if (!reminder) continue;
    if (reminder.type === REMINDER_TYPE.ONE_TIME) oneTimeCount++;
    if (reminder.type === REMINDER_TYPE.DAILY) hasDaily = true;
    if (reminder.type === REMINDER_TYPE.WEEKLY) hasWeekly = true;
  }

  if (oneTimeCount > 0) {
    parts.push(
      `${oneTimeCount} one-time reminder${oneTimeCount > 1 ? "s" : ""}`
    );
  }
  if (hasDaily) parts.push("Daily");
  if (hasWeekly) parts.push("Weekly");

  return parts.join(", ");
};
