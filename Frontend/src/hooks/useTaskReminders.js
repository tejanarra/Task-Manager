import { useState, useCallback } from "react";
import {
  normalizeRemindersBeforeSave,
  regenerateRecurringReminders,
  validateCustomReminder,
} from "../utils/reminderUtils";
import { REMINDER_TYPES } from "../constants/appConstants";

/**
 * Custom hook for managing task reminders
 * @param {Array} initialReminders - Initial reminders array
 * @param {string|Date} deadline - Task deadline
 * @returns {Object} - Reminder management functions and state
 */
const useTaskReminders = (initialReminders = [], deadline = null) => {
  const [reminders, setReminders] = useState(initialReminders);

  const addOneTimeReminder = useCallback((remindBefore) => {
    setReminders((prev) => [
      ...prev,
      {
        remindBefore,
        sent: false,
        type: REMINDER_TYPES.ONE_TIME,
      },
    ]);
  }, []);

  const removeOneTimeReminder = useCallback((remindBefore) => {
    setReminders((prev) =>
      prev.filter(
        (r) =>
          !(r.type === REMINDER_TYPES.ONE_TIME && r.remindBefore === remindBefore)
      )
    );
  }, []);

  const toggleDailyReminders = useCallback(
    (checked) => {
      if (!deadline) return;

      const deadlineDate = new Date(deadline);
      const now = new Date();

      if (checked) {
        const updated = regenerateRecurringReminders(
          reminders,
          REMINDER_TYPES.DAILY,
          deadlineDate,
          now
        );
        setReminders(updated);
      } else {
        setReminders((prev) => prev.filter((r) => r.type !== REMINDER_TYPES.DAILY));
      }
    },
    [reminders, deadline]
  );

  const toggleWeeklyReminders = useCallback(
    (checked) => {
      if (!deadline) return;

      const deadlineDate = new Date(deadline);
      const now = new Date();

      if (checked) {
        const updated = regenerateRecurringReminders(
          reminders,
          REMINDER_TYPES.WEEKLY,
          deadlineDate,
          now
        );
        setReminders(updated);
      } else {
        setReminders((prev) => prev.filter((r) => r.type !== REMINDER_TYPES.WEEKLY));
      }
    },
    [reminders, deadline]
  );

  const addCustomReminder = useCallback(
    (customDate) => {
      if (!deadline) return { success: false, error: "No deadline set" };

      const validation = validateCustomReminder(customDate, deadline);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const deadlineDate = new Date(deadline);
      const reminderDate = new Date(customDate);
      const diffHours = (deadlineDate - reminderDate) / (1000 * 60 * 60);

      setReminders((prev) => [
        ...prev,
        {
          remindBefore: diffHours,
          sent: false,
          type: REMINDER_TYPES.ONE_TIME,
          customDate,
        },
      ]);

      return { success: true, error: null };
    },
    [deadline]
  );

  const removeCustomReminder = useCallback((customDate) => {
    setReminders((prev) => prev.filter((r) => r.customDate !== customDate));
  }, []);

  const normalizeReminders = useCallback(() => {
    if (!deadline) return reminders;
    return normalizeRemindersBeforeSave(reminders, deadline);
  }, [reminders, deadline]);

  const hasDailyReminders = useCallback(() => {
    return reminders.some((r) => r.type === REMINDER_TYPES.DAILY);
  }, [reminders]);

  const hasWeeklyReminders = useCallback(() => {
    return reminders.some((r) => r.type === REMINDER_TYPES.WEEKLY);
  }, [reminders]);

  return {
    reminders,
    setReminders,
    addOneTimeReminder,
    removeOneTimeReminder,
    toggleDailyReminders,
    toggleWeeklyReminders,
    addCustomReminder,
    removeCustomReminder,
    normalizeReminders,
    hasDailyReminders,
    hasWeeklyReminders,
  };
};

export default useTaskReminders;
