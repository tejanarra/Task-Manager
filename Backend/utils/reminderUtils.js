import { DateTime } from "luxon";

export function generateSmartReminders(deadlineISO) {
  if (!deadlineISO) return [];

  const deadline = DateTime.fromISO(deadlineISO).toUTC();
  const now = DateTime.utc();
  const diffHours = deadline.diff(now, "hours").hours;
  if (diffHours <= 0) return [];

  const reminders = [];

  const reminderTime =
    diffHours <= 48
      ? deadline.minus({ hours: 2 })
      : diffHours <= 168
      ? deadline.minus({ hours: 24 })
      : deadline.minus({ days: 7 });

  reminders.push({
    type: "ONE_TIME",
    triggerAtUTC: reminderTime.toISO(),
  });

  return reminders;
}
