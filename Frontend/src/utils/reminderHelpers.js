/**
 * Normalize and calculate remindBefore for all reminders before saving.
 * @param {Array} reminders - List of reminder objects
 * @param {string|Date} deadline - ISO string or Date for task deadline
 * @returns {Array} normalized reminders
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
