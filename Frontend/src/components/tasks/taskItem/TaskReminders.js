"use client";

import React, { useState } from "react";
import ReminderCheckbox from "./ReminderCheckbox";
import { formatDateTimeLocal } from "../../../utils/dateUtils";
import "./Styles/TaskReminders.css";

const TaskReminders = ({
  tempDeadline,
  tempReminders,
  setTempReminders,
  theme,
  ALL_INTERVALS = [],
}) => {
  const [customReminder, setCustomReminder] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const now = new Date();
  const deadlineDate = tempDeadline ? new Date(tempDeadline) : null;
  const diffInHours =
    deadlineDate && deadlineDate > now
      ? (deadlineDate - now) / (1000 * 60 * 60)
      : 0;

  // Helper to check if reminder is one-time (not daily/weekly)
  const isOneTimeReminder = (r) => {
    return !r.type || r.type === "one-time";
  };

  // Check if daily/weekly reminders are active (only one of each type allowed now)
  const hasDailyReminders = tempReminders.some((r) => r.type === "daily");
  const hasWeeklyReminders = tempReminders.some((r) => r.type === "weekly");

  // Toggle daily reminders - simplified to single reminder
  const toggleDailyReminders = (checked) => {
    setTempReminders((prev) => {
      const withoutDaily = prev.filter((r) => r.type !== "daily");

      if (checked && tempDeadline) {
        // Add a single daily reminder
        return [
          ...withoutDaily,
          {
            type: "daily",
            intervalHours: 24,
            sent: false,
            lastSentAt: null,
          },
        ];
      }

      return withoutDaily;
    });
  };

  // Toggle weekly reminders - simplified to single reminder
  const toggleWeeklyReminders = (checked) => {
    setTempReminders((prev) => {
      const withoutWeekly = prev.filter((r) => r.type !== "weekly");

      if (checked && tempDeadline) {
        // Add a single weekly reminder
        return [
          ...withoutWeekly,
          {
            type: "weekly",
            intervalHours: 168,
            sent: false,
            lastSentAt: null,
          },
        ];
      }

      return withoutWeekly;
    });
  };

  // Default intervals (e.g. 1 hr, 1 day, 1 week) - these are one-time reminders
  const defaultIntervals = ALL_INTERVALS.filter((i) => i.value <= diffInHours);

  // Custom reminders - one-time reminders that don't match default intervals
  const customIntervals = tempReminders
    .filter((r) => {
      if (!isOneTimeReminder(r)) return false;

      // Calculate hours before deadline from remindAt
      if (r.remindAt && deadlineDate) {
        const remindDate = new Date(r.remindAt);
        const hours = (deadlineDate - remindDate) / (1000 * 60 * 60);
        if (hours > diffInHours || hours <= 0) return false;

        // Check if this matches any default interval
        const matchesDefault = ALL_INTERVALS.some(
          (ai) => Math.abs(ai.value - hours) < 0.01
        );
        return !matchesDefault;
      }

      return false;
    })
    .map((r) => {
      if (r.remindAt) {
        const remindDate = new Date(r.remindAt);
        const hours = (deadlineDate - remindDate) / (1000 * 60 * 60);
        return {
          remindAt: r.remindAt,
          label: remindDate.toLocaleString(),
          value: hours,
        };
      }
      return null;
    })
    .filter(Boolean);

  // Toggle reminder by hours before deadline
  const toggleReminder = (value, checked) => {
    if (!tempDeadline) return;

    setTempReminders((prev) => {
      if (checked) {
        // Calculate remindAt time
        const deadlineDt = new Date(tempDeadline);
        const remindAt = new Date(
          deadlineDt.getTime() - value * 60 * 60 * 1000
        );

        // Check if already exists (by comparing remindAt times)
        const existing = prev.find(
          (r) => isOneTimeReminder(r) && r.remindAt === remindAt.toISOString()
        );

        if (!existing) {
          return [
            ...prev,
            {
              type: "one-time",
              remindAt: remindAt.toISOString(),
              sent: false,
              lastSentAt: null,
            },
          ];
        }
        return prev;
      } else {
        // Remove by matching the calculated remindAt
        const deadlineDt = new Date(tempDeadline);
        const remindAt = new Date(
          deadlineDt.getTime() - value * 60 * 60 * 1000
        ).toISOString();
        return prev.filter(
          (r) => !isOneTimeReminder(r) || r.remindAt !== remindAt
        );
      }
    });
  };

  // Add custom reminder
  const handleAddCustomReminder = () => {
    if (!customReminder || !tempDeadline) return;

    const selectedDate = new Date(customReminder);
    const deadlineDt = new Date(tempDeadline);

    // Validation
    if (isNaN(selectedDate.getTime())) {
      console.warn("Invalid date selected");
      return;
    }

    if (selectedDate >= deadlineDt) {
      console.warn("Custom reminder must be before deadline");
      return;
    }

    if (selectedDate <= now) {
      console.warn("Custom reminder must be in the future");
      return;
    }

    const remindAtISO = selectedDate.toISOString();

    setTempReminders((prev) => {
      // Check if this exact reminder already exists
      const exists = prev.some(
        (r) => isOneTimeReminder(r) && r.remindAt === remindAtISO
      );

      if (!exists) {
        return [
          ...prev,
          {
            type: "one-time",
            remindAt: remindAtISO,
            sent: false,
            lastSentAt: null,
          },
        ];
      }
      return prev;
    });

    setCustomReminder("");
  };

  // Calculate how many days/weeks until deadline
  const maxDays = Math.floor(diffInHours / 24);
  const maxWeeks = Math.floor(diffInHours / (24 * 7));

  return (
    <div className="task-reminders-container">
      {/* Dropdown Header Bar */}
      <div className="reminders-dropdown" onClick={() => setIsOpen(!isOpen)}>
        <div className="reminders-dropdown-header">
          <h6>
            <i className="bi bi-clock"></i> Reminders
            {tempReminders.length > 0 && (
              <span className="reminder-count-badge">
                {tempReminders.length}
              </span>
            )}
          </h6>
          {isOpen ? (
            <i className="bi bi-chevron-up"></i>
          ) : (
            <i className="bi bi-chevron-down"></i>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="reminders-dropdown-content">
          {/* Recurring Reminders Section */}
          {(maxDays > 0 || maxWeeks > 0) && (
            <div className="recurring-reminders-section">
              <label className="reminder-section-label">
                <i className="bi bi-arrow-repeat"></i> Recurring Reminders:
              </label>
              <div className="recurring-options">
                {maxDays > 0 && (
                  <div className="recurring-option">
                    <input
                      type="checkbox"
                      checked={hasDailyReminders}
                      onChange={(e) => toggleDailyReminders(e.target.checked)}
                      id="daily-reminders"
                    />
                    <label htmlFor="daily-reminders">
                      Daily reminders until deadline
                    </label>
                  </div>
                )}
                {maxWeeks > 0 && (
                  <div className="recurring-option">
                    <input
                      type="checkbox"
                      checked={hasWeeklyReminders}
                      onChange={(e) => toggleWeeklyReminders(e.target.checked)}
                      id="weekly-reminders"
                    />
                    <label htmlFor="weekly-reminders">
                      Weekly reminders until deadline
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* One-time Reminders Section */}
          {defaultIntervals.length > 0 && (
            <div className="reminder-section">
              <label className="reminder-section-label">
                <i className="bi bi-bell"></i> One-time Reminders:
              </label>
              <div className="reminder-grid">
                {defaultIntervals.map((item) => {
                  // Calculate the expected remindAt for this interval
                  const expectedRemindAt = tempDeadline
                    ? new Date(
                        new Date(tempDeadline).getTime() -
                          item.value * 60 * 60 * 1000
                      ).toISOString()
                    : null;

                  // Check if reminder exists by matching remindAt
                  const existing = tempReminders.find(
                    (r) =>
                      isOneTimeReminder(r) && r.remindAt === expectedRemindAt
                  );
                  const checked = !!existing;

                  return (
                    <ReminderCheckbox
                      key={item.value}
                      value={item.value}
                      label={item.label}
                      checked={checked}
                      onChange={(checked) =>
                        toggleReminder(item.value, checked)
                      }
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Reminder Section */}
          <div className="custom-reminder-section">
            <label className="reminder-section-label">
              <i className="bi bi-calendar-plus"></i> Add Custom Reminder:
            </label>
            <div className="custom-reminder-input-group">
              <input
                type="datetime-local"
                value={customReminder}
                onChange={(e) => setCustomReminder(e.target.value)}
                min={formatDateTimeLocal(now.toISOString())}
                max={
                  tempDeadline ? formatDateTimeLocal(tempDeadline) : undefined
                }
              />
              <button
                className={`btn btn-sm ${
                  theme === "dark" ? "btn-outline-light" : "btn-outline-dark"
                }`}
                onClick={handleAddCustomReminder}
                disabled={!customReminder}
              >
                <i className="bi bi-plus-lg"></i> Add
              </button>
            </div>
          </div>

          {/* Custom One-time Reminders Section */}
          {customIntervals.length > 0 && (
            <div className="reminder-section">
              <label className="reminder-section-label">
                <i className="bi bi-calendar-check"></i> Custom One-time
                Reminders:
              </label>
              <div className="reminder-grid">
                {customIntervals.map((item, index) => {
                  const checked = tempReminders.some(
                    (r) => isOneTimeReminder(r) && r.remindAt === item.remindAt
                  );

                  return (
                    <ReminderCheckbox
                      key={item.remindAt || `${item.value}-${index}`}
                      value={item.value}
                      label={item.label}
                      checked={checked}
                      onChange={(checked) => {
                        if (!checked) {
                          // Remove by remindAt
                          setTempReminders((prev) =>
                            prev.filter((r) => r.remindAt !== item.remindAt)
                          );
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Active reminders summary */}
          {tempReminders.length > 0 && (
            <div className="active-reminders-summary">
              <small>
                <i className="bi bi-info-circle"></i> <strong>Active:</strong>
                {hasDailyReminders && " Daily"}
                {hasDailyReminders && hasWeeklyReminders && ","}
                {hasWeeklyReminders && " Weekly"}
                {(hasDailyReminders || hasWeeklyReminders) &&
                  tempReminders.filter(isOneTimeReminder).length > 0 &&
                  ","}
                {tempReminders.filter(isOneTimeReminder).length > 0 &&
                  ` ${tempReminders.filter(isOneTimeReminder).length} one-time`}
              </small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskReminders;
