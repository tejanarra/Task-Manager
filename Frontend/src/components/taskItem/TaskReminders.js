import React, { useState, useMemo } from "react";
import ReminderCheckbox from "./ReminderCheckbox";
import { formatDateTimeLocal } from "../../utils/dateUtils";
import "./Styles/TaskReminders.css";

const isDaily = (r) => r?.type === "daily" || r?.type === "DAILY";
const isWeekly = (r) => r?.type === "weekly" || r?.type === "WEEKLY";

export const formatHoursLabel = (h) => {
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 24) return `${h} hr${h !== 1 ? "s" : ""}`;
  const days = h / 24;
  if (days < 7) return `${Math.round(days)} day${days !== 1 ? "s" : ""}`;
  return `${Math.round(days / 7)} week${days / 7 !== 1 ? "s" : ""}`;
};

// ✅ Conversions between Local ↔ UTC (DST safe)
const parseLocalHour = (hh) => {
  const [h] = hh.split(":");
  return Math.min(Math.max(parseInt(h), 0), 23);
};

const localHourToUTC = (localHour) => {
  const d = new Date();
  d.setHours(localHour, 0, 0, 0);
  return d.getUTCHours();
};

const utcHourToLocalHH = (utcHour) => {
  const base = new Date(Date.UTC(2000, 0, 1, utcHour, 0, 0));
  const hh = base.getHours();
  return `${String(hh).padStart(2, "0")}:00`;
};

// Weekly conversion helpers
const localWeeklyToUTC = (localDay, localHour) => {
  const now = new Date();
  const diff = (localDay - now.getDay() + 7) % 7;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  d.setHours(localHour, 0, 0, 0);
  return {
    utcDay: d.getUTCDay(),
    utcHour: d.getUTCHours(),
  };
};

const utcWeeklyToLocal = (utcDay, utcHour) => {
  const d = new Date(Date.UTC(2000, 0, 2 + utcDay, utcHour));
  return {
    localDay: d.getDay(),
    localHour: d.getHours(),
  };
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TaskReminders = ({
  tempDeadline,
  tempReminders,
  setTempReminders,
  theme,
  ALL_INTERVALS,
}) => {
  const deadline = tempDeadline ? new Date(tempDeadline) : null;
  const now = new Date();
  const diffHrs = deadline ? (deadline - now) / 36e5 : 0;

  const maxDays = Math.floor(diffHrs / 24);
  const maxWeeks = Math.floor(diffHrs / 168);

  const dailyObj = useMemo(() => tempReminders.find(isDaily), [tempReminders]);
  const weeklyObj = useMemo(
    () => tempReminders.find(isWeekly),
    [tempReminders]
  );

  const hasDaily = !!dailyObj;
  const hasWeekly = !!weeklyObj;

  const [dailyTime, setDailyTime] = useState(
    dailyObj?.hourOfDayUTC != null
      ? utcHourToLocalHH(dailyObj.hourOfDayUTC)
      : "09:00"
  );

  const [weeklyDay, setWeeklyDay] = useState(() =>
    weeklyObj?.dayOfWeek != null
      ? utcWeeklyToLocal(weeklyObj.dayOfWeek, weeklyObj.hourOfDayUTC).localDay
      : 1
  );
  const [weeklyTime, setWeeklyTime] = useState(() =>
    weeklyObj?.hourOfDayUTC != null
      ? `${String(
          utcWeeklyToLocal(weeklyObj.dayOfWeek, weeklyObj.hourOfDayUTC)
            .localHour
        ).padStart(2, "0")}:00`
      : "09:00"
  );

  const toggleDaily = (checked) => {
    setTempReminders((prev) => {
      const filtered = prev.filter((r) => !isDaily(r));
      if (!checked) return filtered;
      const hrLocal = parseLocalHour(dailyTime);
      return [
        ...filtered,
        {
          type: "daily",
          hourOfDayUTC: localHourToUTC(hrLocal),
        },
      ];
    });
  };

  const onDailyTime = (v) => {
    setDailyTime(v);
    const hrLocal = parseLocalHour(v);
    setTempReminders((prev) =>
      prev.map((r) =>
        isDaily(r) ? { ...r, hourOfDayUTC: localHourToUTC(hrLocal) } : r
      )
    );
  };

  const toggleWeekly = (checked) => {
    setTempReminders((prev) => {
      const filtered = prev.filter((r) => !isWeekly(r));
      if (!checked) return filtered;
      const hrLocal = parseLocalHour(weeklyTime);
      const { utcDay, utcHour } = localWeeklyToUTC(weeklyDay, hrLocal);
      return [
        ...filtered,
        {
          type: "weekly",
          dayOfWeek: utcDay,
          hourOfDayUTC: utcHour,
        },
      ];
    });
  };

  const updateWeeklyDay = (v) => {
    const d = Number(v);
    setWeeklyDay(d);
    setTempReminders((prev) =>
      prev.map((r) =>
        isWeekly(r)
          ? {
              ...r,
              ...localWeeklyToUTC(d, parseLocalHour(weeklyTime)),
            }
          : r
      )
    );
  };

  const updateWeeklyTime = (v) => {
    setWeeklyTime(v);
    setTempReminders((prev) =>
      prev.map((r) =>
        isWeekly(r)
          ? {
              ...r,
              ...localWeeklyToUTC(weeklyDay, parseLocalHour(v)),
            }
          : r
      )
    );
  };

  // One-time reminders
  const toggleOneTime = (val, checked) => {
    setTempReminders((prev) => {
      if (!checked)
        return prev.filter(
          (r) =>
            isWeekly(r) || isDaily(r) || Math.abs(r.remindBefore - val) >= 0.01
        );

      const exists = prev.some(
        (r) => !r.type && Math.abs(r.remindBefore - val) < 0.01
      );
      if (!exists) return [...prev, { remindBefore: val, sent: false }];
      return prev;
    });
  };

  const [custom, setCustom] = useState("");
  const addCustom = () => {
    if (!custom || !deadline) return;
    const d = new Date(custom);
    if (d >= deadline) return;
    const hours = (deadline - d) / 36e5;
    if (hours <= 0 || hours > diffHrs) return;

    setTempReminders((prev) => [
      ...prev,
      { remindBefore: hours, customDate: d.toISOString() },
    ]);
    setCustom("");
  };

  const defaultIntervals = ALL_INTERVALS.filter((i) => i.value <= diffHrs);
  const customIntervals = tempReminders
    .filter(
      (r) =>
        !isDaily(r) &&
        !isWeekly(r) &&
        r.remindBefore <= diffHrs &&
        !ALL_INTERVALS.some((ai) => Math.abs(ai.value - r.remindBefore) < 0.01)
    )
    .map((r) => ({
      value: r.remindBefore,
      label: r.customDate
        ? new Date(r.customDate).toLocaleString()
        : formatHoursLabel(r.remindBefore),
    }));

  const [open, setOpen] = useState(false);

  return (
    <div className="task-reminders-container">
      <div className="reminders-dropdown" onClick={() => setOpen(!open)}>
        <div className="reminders-dropdown-header">
          <h6>Reminders</h6>
          <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"}`} />
        </div>
      </div>

      {open && (
        <div className="reminders-dropdown-content">
          {/* Custom absolute reminder */}
          <div className="custom-reminder-section">
            <label className="reminder-section-label">
              Add Custom Reminder:
            </label>
            <div className="custom-reminder-input-group">
              <input
                type="datetime-local"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                min={formatDateTimeLocal(new Date().toISOString())}
                max={
                  tempDeadline ? formatDateTimeLocal(tempDeadline) : undefined
                }
              />
              <button
                className={`btn btn-sm ${
                  theme === "dark" ? "btn-outline-light" : "btn-outline-dark"
                }`}
                onClick={addCustom}
              >
                Add
              </button>
            </div>
          </div>

          {/* Recurring */}
          {(maxDays > 0 || maxWeeks > 0) && (
            <div className="recurring-reminders-section">
              <label className="reminder-section-label">
                Recurring Reminders:
              </label>

              {/* Daily */}
              <div className="recurring-option">
                <input
                  type="checkbox"
                  checked={hasDaily}
                  onChange={(e) => toggleDaily(e.target.checked)}
                />
                <span className="ms-2">Daily at</span>
                <input
                  type="time"
                  value={dailyTime}
                  step={3600}
                  disabled={!hasDaily}
                  onChange={(e) => onDailyTime(e.target.value)}
                  className="ms-2"
                />
              </div>

              {/* Weekly */}
              <div className="recurring-option mt-2">
                <input
                  type="checkbox"
                  checked={hasWeekly}
                  onChange={(e) => toggleWeekly(e.target.checked)}
                />
                <span className="ms-2">Weekly on</span>
                <select
                  value={weeklyDay}
                  disabled={!hasWeekly}
                  className="mx-2"
                  onChange={(e) => updateWeeklyDay(e.target.value)}
                >
                  {DAY_LABELS.map((d, i) => (
                    <option key={i} value={i}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={weeklyTime}
                  step={3600}
                  disabled={!hasWeekly}
                  onChange={(e) => updateWeeklyTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Default One-time */}
          {defaultIntervals.length > 0 && (
            <div className="reminder-section">
              <label className="reminder-section-label">
                One-time Presets:
              </label>
              <div className="reminder-grid">
                {defaultIntervals.map((i) => (
                  <ReminderCheckbox
                    key={i.value}
                    checked={
                      !!tempReminders.find(
                        (r) =>
                          !r.type && Math.abs(r.remindBefore - i.value) < 0.01
                      )
                    }
                    label={i.label}
                    onChange={(checked) => toggleOneTime(i.value, checked)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Custom one-time list */}
          {customIntervals.length > 0 && (
            <div className="reminder-section">
              <label className="reminder-section-label">Custom:</label>
              <div className="reminder-grid">
                {customIntervals.map((i) => (
                  <ReminderCheckbox
                    key={i.value}
                    checked
                    label={i.label}
                    onChange={(checked) => toggleOneTime(i.value, checked)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskReminders;
