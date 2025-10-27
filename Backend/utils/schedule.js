// src/utils/schedule.js
import { DateTime } from "luxon";

/**
 * Compute the next run in UTC.
 * For DAILY/WEEKLY we interpret hourOfDayUTC as already UTC.
 * If you want local-hour semantics, store local hour & convert to UTC using user's TZ.
 */
export function computeNextRunAtUTC({
  type,
  triggerAtUTC,
  hourOfDayUTC,
  dayOfWeek, // 0..6, Sun=0
  now = new Date(),
}) {
  const nowUtc = DateTime.fromJSDate(now, { zone: "utc" });

  if (type === "ONE_TIME") {
    if (!triggerAtUTC) return null;
    const t = DateTime.fromISO(String(triggerAtUTC), { zone: "utc" });
    return t <= nowUtc ? null : t.toJSDate();
  }

  if (type === "DAILY") {
    if (hourOfDayUTC == null) return null;
    let candidate = nowUtc.set({ hour: hourOfDayUTC, minute: 0, second: 0, millisecond: 0 });
    if (candidate <= nowUtc) candidate = candidate.plus({ days: 1 });
    return candidate.toJSDate();
  }

  if (type === "WEEKLY") {
    if (hourOfDayUTC == null || dayOfWeek == null) return null;
    // luxon: weekday 1..7 (Mon..Sun)
    const currentDow = nowUtc.weekday % 7; // 0..6 with Sun=0
    const diff = (dayOfWeek - currentDow + 7) % 7;
    let candidate = nowUtc.plus({ days: diff }).set({ hour: hourOfDayUTC, minute: 0, second: 0, millisecond: 0 });
    if (candidate <= nowUtc) candidate = candidate.plus({ weeks: 1 });
    return candidate.toJSDate();
  }

  return null;
}

export function advanceNextRunAtUTC({
  type,
  hourOfDayUTC,
  dayOfWeek,
  now = new Date(),
}) {
  const nowUtc = DateTime.fromJSDate(now, { zone: "utc" });
  if (type === "ONE_TIME") return null; // completes
  if (type === "DAILY") {
    return nowUtc.plus({ days: 1 }).set({ hour: hourOfDayUTC ?? 0, minute: 0, second: 0, millisecond: 0 }).toJSDate();
  }
  if (type === "WEEKLY") {
    return nowUtc.plus({ weeks: 1 }).set({ hour: hourOfDayUTC ?? 0, minute: 0, second: 0, millisecond: 0 }).toJSDate();
  }
  return null;
}
