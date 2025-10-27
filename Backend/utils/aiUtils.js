import { DateTime } from "luxon";

// Validate UTC deadline
export function validateDeadline(deadlineISO) {
  if (!deadlineISO) return null;

  const now = DateTime.utc();
  const deadline = DateTime.fromISO(deadlineISO).toUTC();
  if (!deadline.isValid) return null;

  if (deadline <= now.plus({ hours: 1 })) return null;
  if (deadline > now.plus({ years: 2 })) return null;

  return deadline.toISO();
}

export function parseNaturalDate(dateStr, context = "") {
  if (!dateStr || typeof dateStr !== "string") return null;

  const now = DateTime.utc();
  const input = (context + " " + dateStr).toLowerCase().trim();

  if (/tomorrow/.test(input))
    return now.plus({ days: 1 }).set({ hour: 18 }).toISO();

  if (/next\s+week/.test(input))
    return now.plus({ weeks: 1 }).set({ hour: 18 }).toISO();

  const daysMatch = input.match(/in\s*(\d+)\s*days/);
  if (daysMatch)
    return now
      .plus({ days: Number(daysMatch[1]) })
      .set({ hour: 18 })
      .toISO();

  const parsed = DateTime.fromISO(dateStr);
  if (parsed.isValid && parsed > now)
    return parsed
      .set({ hour: parsed.hour || 18 })
      .toUTC()
      .toISO();

  return null;
}

export function normalizeReminders(reminders, deadlineISO) {
  if (!deadlineISO) return [];

  const deadline = DateTime.fromISO(deadlineISO).toUTC();
  const now = DateTime.utc();
  const diffHours = deadline.diff(now, "hours").hours;

  if (diffHours <= 0) return [];

  const result = [];

  const reminderTime =
    diffHours <= 48
      ? deadline.minus({ hours: 2 })
      : diffHours <= 168
      ? deadline.minus({ hours: 24 })
      : deadline.minus({ days: 7 });

  result.push({
    type: "ONE_TIME",
    triggerAtUTC: reminderTime.toISO(),
  });

  return result;
}
