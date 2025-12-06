"use client";

import { useState, useCallback } from "react";
import {
  normalizeRemindersBeforeSave,
  toggleRecurringReminder,
  validateCustomReminder,
  createOneTimeReminder,
  createOneTimeReminderFromDate,
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
    if (!deadline) return;

    const newReminder = createOneTimeReminder(remindBefore, deadline);
    if (newReminder) {
      setReminders((prev) => [...prev, newReminder]);
    }
  }, [deadline]);

  const removeOneTimeReminder = useCallback((remindAt) => {
    setReminders((prev) =>
      prev.filter((r) => !(r.type === REMINDER_TYPES.ONE_TIME && r.remindAt === remindAt))
    );
  }, []);

  const toggleDailyReminders = useCallback(
    (checked) => {
      if (!deadline) return;
      const updated = toggleRecurringReminder(reminders, REMINDER_TYPES.DAILY, checked, deadline);
      setReminders(updated);
    },
    [reminders, deadline]
  );

  const toggleWeeklyReminders = useCallback(
    (checked) => {
      if (!deadline) return;
      const updated = toggleRecurringReminder(reminders, REMINDER_TYPES.WEEKLY, checked, deadline);
      setReminders(updated);
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

      const newReminder = createOneTimeReminderFromDate(customDate, deadline);
      if (newReminder) {
        setReminders((prev) => [...prev, newReminder]);
        return { success: true, error: null };
      }

      return { success: false, error: "Failed to create reminder" };
    },
    [deadline]
  );

  const removeCustomReminder = useCallback((remindAt) => {
    setReminders((prev) => prev.filter((r) => r.remindAt !== remindAt));
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
