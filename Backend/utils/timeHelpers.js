import { DateTime } from "luxon";

/* =====================================
   Timezone utilities
   ===================================== */

export const getUserTimeZone = (req) =>
  (req.headers["x-user-timezone"] && String(req.headers["x-user-timezone"])) ||
  "UTC";

// If ISO has no zone info, interpret in user's zone; if it has zone, respect it.
const parseToUserZone = (input, userTimeZone) => {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();

  // Detect timezone designator (Z or ±HH:MM)
  const hasZone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed);
  const dt = hasZone
    ? DateTime.fromISO(trimmed, { setZone: true }) // keep provided zone
    : DateTime.fromISO(trimmed, { zone: userTimeZone }); // assume local
  return dt.isValid ? dt : null;
};

/**
 * Interpret an ISO-like string's wall-clock fields (Y-M-D H:M:S) as **local time**,
 * even if the string mistakenly ends with 'Z' or contains an offset.
 * This prevents "10 PM local" becoming "6 PM local" because of a stray Z.
 */
const interpretISOAsLocalWallTime = (input, userTimeZone) => {
  if (!input || typeof input !== "string") return null;
  const raw = input.trim();

  // Parse with zone if present just to extract components,
  // but we will *rebuild* in user's zone to keep wall time.
  const tmp = DateTime.fromISO(raw, { setZone: true });
  if (!tmp.isValid) return null;

  const parts = {
    year: tmp.year,
    month: tmp.month,
    day: tmp.day,
    hour: Number.isFinite(tmp.hour) ? tmp.hour : 0,
    minute: Number.isFinite(tmp.minute) ? tmp.minute : 0,
    second: Number.isFinite(tmp.second) ? tmp.second : 0,
    millisecond: 0,
  };

  const local = DateTime.fromObject(parts, { zone: userTimeZone });
  return local.isValid ? local : null;
};

/* =====================================
   Natural language time extraction
   ===================================== */

// Extract explicit time from text; returns {hour, minute} 24h or null.
export const extractTimeFromText = (text) => {
  if (!text || typeof text !== "string") return null;
  const s = text.trim();

  // 1) HH:MM AM/PM
  let m = s.match(/(\d{1,2}):(\d{2})\s*(am|pm)\b/i);
  if (m) {
    let hour = parseInt(m[1], 10);
    let minute = parseInt(m[2], 10);
    const mer = m[3].toLowerCase();
    if (mer === "pm" && hour < 12) hour += 12;
    if (mer === "am" && hour === 12) hour = 0;
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return { hour, minute };
  }

  // 2) HH AM/PM
  m = s.match(/(\d{1,2})\s*(am|pm)\b/i);
  if (m) {
    let hour = parseInt(m[1], 10);
    const mer = m[2].toLowerCase();
    if (mer === "pm" && hour < 12) hour += 12;
    if (mer === "am" && hour === 12) hour = 0;
    if (!Number.isFinite(hour)) return null;
    return { hour, minute: 0 };
  }

  // 3) 24h HH:MM
  m = s.match(/\b(\d{1,2}):(\d{2})\b/);
  if (m) {
    const hour = parseInt(m[1], 10);
    const minute = parseInt(m[2], 10);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return { hour, minute };
  }

  return null;
};

/* =====================================
   Reminder Normalization
   ===================================== */

export const normalizeReminders = (reminders, deadline, promptContext = "") => {
  if (!Array.isArray(reminders) || !deadline) return [];

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffInHours = (deadlineDate - now) / (1000 * 60 * 60);

  if (diffInHours <= 0) return [];

  const normalized = [];
  const seen = new Set(); // Prevent duplicate reminders

  const wantsDaily =
    /(?:^|\b)(daily|every\s*day|everyday|each\s*day)(?:\b|$)/i.test(
      promptContext
    );
  const wantsWeekly = /(?:^|\b)(weekly|every\s*week|each\s*week)(?:\b|$)/i.test(
    promptContext
  );

  // If user asked daily/weekly, generate recurring lead-ups (preview-side logic)
  if (wantsDaily && diffInHours >= 24) {
    const maxDays = Math.floor(diffInHours / 24);
    for (let day = 1; day <= maxDays; day++) {
      const hours = day * 24;
      normalized.push({
        remindBefore: hours,
        sent: false,
        type: "daily",
        dayNumber: day,
      });
    }
    return normalized;
  }

  if (wantsWeekly && diffInHours >= 168) {
    const maxWeeks = Math.floor(diffInHours / (24 * 7));
    for (let week = 1; week <= maxWeeks; week++) {
      const hours = week * 24 * 7;
      normalized.push({
        remindBefore: hours,
        sent: false,
        type: "weekly",
        weekNumber: week,
      });
    }
    return normalized;
  }

  // One-time / explicit reminders
  reminders.forEach((reminder) => {
    if (!reminder || typeof reminder !== "object") return;

    const remindBefore = Number(reminder.remindBefore);
    if (isNaN(remindBefore) || remindBefore <= 0 || remindBefore > diffInHours)
      return;

    const baseReminder = { remindBefore, sent: false };

    if (reminder.type === "daily") {
      const maxDays = Math.floor(diffInHours / 24);
      for (let day = 1; day <= maxDays; day++) {
        const hours = day * 24;
        const key = `daily-${hours}`;
        if (!seen.has(key)) {
          normalized.push({
            ...baseReminder,
            remindBefore: hours,
            type: "daily",
            dayNumber: day,
          });
          seen.add(key);
        }
      }
    } else if (reminder.type === "weekly") {
      const maxWeeks = Math.floor(diffInHours / (24 * 7));
      for (let week = 1; week <= maxWeeks; week++) {
        const hours = week * 24 * 7;
        const key = `weekly-${hours}`;
        if (!seen.has(key)) {
          normalized.push({
            ...baseReminder,
            remindBefore: hours,
            type: "weekly",
            weekNumber: week,
          });
          seen.add(key);
        }
      }
    } else {
      const key = `onetime-${remindBefore}`;
      if (!seen.has(key)) {
        normalized.push({
          ...baseReminder,
          customDate: reminder.customDate || undefined,
        });
        seen.add(key);
      }
    }
  });

  return normalized;
};

/* =====================================
   Timezone-aware validation & parsing
   ===================================== */

/**
 * Validate that a given deadline string (interpreted in user's zone if no zone)
 * is at least 1 hour in the future and not more than 2 years out.
 * Returns ISO UTC or null.
 */
export const validateDeadline = (deadline, userTimeZone = "UTC") => {
  if (!deadline) return null;

  try {
    const parsedUser = parseToUserZone(deadline, userTimeZone);
    if (!parsedUser) return null;

    const now = DateTime.now().setZone(userTimeZone);
    if (parsedUser <= now.plus({ hours: 1 })) return null; // at least 1hr in future
    if (parsedUser > now.plus({ years: 2 })) return null; // <= 2 years from now

    return parsedUser.toUTC().toISO(); // store UTC
  } catch {
    return null;
  }
};

/**
 * Parse natural expressions (tomorrow, next Friday, in 3 days, etc.) in user's zone,
 * applying a sensible default time if none provided. Returns ISO UTC or null.
 */
export const parseNaturalDate = (
  dateStr,
  conversationContext = "",
  userTimeZone = "UTC"
) => {
  if (!dateStr || typeof dateStr !== "string") return null;

  const now = DateTime.now().setZone(userTimeZone);
  const lowerStr = dateStr.toLowerCase().trim();
  const full = (conversationContext + " " + lowerStr).toLowerCase();

  // Default time is 6 PM local if not specified
  let defaultHour = 18;
  let defaultMinute = 0;

  // Try to extract explicit time; if found, use it; else use default.
  const t = extractTimeFromText(full);
  const targetHour = Number.isFinite(t?.hour) ? t.hour : defaultHour;
  const targetMinute = Number.isFinite(t?.minute) ? t.minute : defaultMinute;

  // "in X {months|weeks|days|hours}"
  const inPatterns = [
    { regex: /in\s*(\d+)\s*months?/, unit: "months" },
    { regex: /in\s*(\d+)\s*weeks?/, unit: "weeks" },
    { regex: /in\s*(\d+)\s*days?/, unit: "days" },
    { regex: /in\s*(\d+)\s*hours?/, unit: "hours" },
  ];
  for (const { regex, unit } of inPatterns) {
    const m = full.match(regex);
    if (m) {
      const val = parseInt(m[1], 10);
      if (!Number.isFinite(val)) break;
      let future = now.plus({ [unit]: val });
      if (unit !== "hours") {
        future = future.set({
          hour: targetHour,
          minute: targetMinute,
          second: 0,
          millisecond: 0,
        });
      }
      return future.toUTC().toISO();
    }
  }

  // Relative words
  if (/tomorrow/.test(full)) {
    const future = now.plus({ days: 1 }).set({
      hour: targetHour,
      minute: targetMinute,
      second: 0,
      millisecond: 0,
    });
    return future.toUTC().toISO();
  }
  if (/next week/.test(full)) {
    const future = now.plus({ weeks: 1 }).set({
      hour: targetHour,
      minute: targetMinute,
      second: 0,
      millisecond: 0,
    });
    return future.toUTC().toISO();
  }
  if (/next month/.test(full)) {
    const future = now.plus({ months: 1 }).set({
      hour: targetHour,
      minute: targetMinute,
      second: 0,
      millisecond: 0,
    });
    return future.toUTC().toISO();
  }

  // "next friday" etc., strictly the next occurrence (1..7 days from now)
  const daysOfWeekLuxon = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
  };
  const nextDayPattern =
    /next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i;
  const dayMatch = full.match(nextDayPattern);
  if (dayMatch) {
    const targetName = dayMatch[1].toLowerCase();
    const targetWeekday = daysOfWeekLuxon[targetName];
    if (targetWeekday) {
      const delta = (targetWeekday - now.weekday + 7) % 7 || 7; // 1..7
      const future = now.plus({ days: delta }).set({
        hour: targetHour,
        minute: targetMinute,
        second: 0,
        millisecond: 0,
      });
      return future.toUTC().toISO();
    }
  }

  // Direct ISO or standard date: if no zone in input, interpret in user's zone.
  const parsedDirect = parseToUserZone(dateStr, userTimeZone);
  if (parsedDirect && parsedDirect > now) {
    const final =
      extractTimeFromText(dateStr) || dateStr.includes(":")
        ? parsedDirect
        : parsedDirect.set({
            hour: targetHour,
            minute: targetMinute,
            second: 0,
            millisecond: 0,
          });
    return final.toUTC().toISO();
  }

  return null;
};

/* =====================================
   AI Deadline Standardization
   ===================================== */

/**
 * Accepts whatever the model returned as "deadline" and converts it to **ISO UTC**,
 * while preserving the user's intended local wall time:
 *
 * - If it's natural text → parseNaturalDate (local) → UTC.
 * - If it's ISO without zone → interpret in user's zone → UTC.
 * - If it has 'Z' or offset (AI mistake) → treat as **local wall time** by
 *   rebuilding the datetime in user's zone using the same clock fields → UTC.
 * - Enforces >= 1 hour in future and <= 2 years from now (via validateDeadline).
 */
export const standardizeAIDeadlineToUTC = (
  aiDeadline,
  conversationContext = "",
  userTimeZone = "UTC"
) => {
  if (!aiDeadline || typeof aiDeadline !== "string") return null;

  const trimmed = aiDeadline.trim();

  // 1) Try natural language parsing using conversation context
  const fromNatural = parseNaturalDate(
    trimmed,
    conversationContext,
    userTimeZone
  );
  if (fromNatural) {
    return validateDeadline(fromNatural, userTimeZone);
  }

  // 2) If looks like ISO but has Z/offset (AI mistake), keep clock as local
  const hasZone = /[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed);
  if (hasZone) {
    const localWall = interpretISOAsLocalWallTime(trimmed, userTimeZone);
    if (localWall) {
      const utcISO = localWall.toUTC().toISO();
      return validateDeadline(utcISO, userTimeZone);
    }
  }

  // 3) Plain ISO w/o zone: interpret in user's zone
  const local = DateTime.fromISO(trimmed, { zone: userTimeZone });
  if (local.isValid) {
    const utcISO = local.toUTC().toISO();
    return validateDeadline(utcISO, userTimeZone);
  }

  return null;
};
