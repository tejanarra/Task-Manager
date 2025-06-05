import React, { useState } from "react";
import ReminderCheckbox from "./ReminderCheckbox";
import { formatDateTimeLocal } from "../../utils/dateUtils";
import "./Styles/TaskReminders.css";

export const formatHoursLabel = (h) => {
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 24)
    return `${h % 1 === 0 ? h : h.toFixed(1)} hr${h !== 1 ? "s" : ""}`;
  const days = h / 24;
  if (days < 7)
    return `${days % 1 === 0 ? days : days.toFixed(1)} day${
      days !== 1 ? "s" : ""
    }`;
  const weeks = days / 7;
  return `${weeks % 1 === 0 ? weeks : weeks.toFixed(1)} week${
    weeks !== 1 ? "s" : ""
  }`;
};

const TaskReminders = ({
  tempDeadline,
  tempReminders,
  setTempReminders,
  theme,
  ALL_INTERVALS,
  formatHoursLabel,
}) => {
  const now = new Date();
  const deadlineDate = tempDeadline ? new Date(tempDeadline) : null;
  const diffInHours =
    deadlineDate && deadlineDate > now
      ? (deadlineDate - now) / (1000 * 60 * 60)
      : 0;

  // Helper function to generate daily reminders
  const generateDailyReminders = () => {
    const reminders = [];
    const maxDays = Math.floor(diffInHours / 24);
    
    for (let day = 1; day <= maxDays; day++) {
      const hoursBeforeDeadline = day * 24;
      reminders.push({
        remindBefore: hoursBeforeDeadline,
        sent: false,
        type: 'daily',
        dayNumber: day
      });
    }
    return reminders;
  };

  // Helper function to generate weekly reminders
  const generateWeeklyReminders = () => {
    const reminders = [];
    const maxWeeks = Math.floor(diffInHours / (24 * 7));
    
    for (let week = 1; week <= maxWeeks; week++) {
      const hoursBeforeDeadline = week * 24 * 7;
      reminders.push({
        remindBefore: hoursBeforeDeadline,
        sent: false,
        type: 'weekly',
        weekNumber: week
      });
    }
    return reminders;
  };

  // Check if daily reminders are active
  const hasDailyReminders = tempReminders.some(r => r.type === 'daily');
  
  // Check if weekly reminders are active
  const hasWeeklyReminders = tempReminders.some(r => r.type === 'weekly');

  // Toggle daily reminders
  const toggleDailyReminders = (checked) => {
    setTempReminders(prev => {
      if (checked) {
        // Remove any existing daily reminders and add new ones
        const withoutDaily = prev.filter(r => r.type !== 'daily');
        const dailyReminders = generateDailyReminders();
        return [...withoutDaily, ...dailyReminders];
      } else {
        // Remove all daily reminders
        return prev.filter(r => r.type !== 'daily');
      }
    });
  };

  // Toggle weekly reminders
  const toggleWeeklyReminders = (checked) => {
    setTempReminders(prev => {
      if (checked) {
        // Remove any existing weekly reminders and add new ones
        const withoutWeekly = prev.filter(r => r.type !== 'weekly');
        const weeklyReminders = generateWeeklyReminders();
        return [...withoutWeekly, ...weeklyReminders];
      } else {
        // Remove all weekly reminders
        return prev.filter(r => r.type !== 'weekly');
      }
    });
  };

  // Default intervals (e.g. 1 hr, 1 day, 1 week) - these are one-time reminders
  const defaultIntervals = ALL_INTERVALS.filter((i) => i.value <= diffInHours);

  // Custom reminders: if added via the datetime-local input, they store a customDate.
  // Also exclude daily/weekly reminders from this list since they're handled separately
  const customIntervals = tempReminders
    .filter(
      (r) =>
        !r.type && // Only non-recurring reminders
        !ALL_INTERVALS.some(
          (ai) => Math.abs(ai.value - r.remindBefore) < 0.01
        ) && r.remindBefore <= diffInHours
    )
    .map((r) => {
      if (r.customDate) {
        return {
          value: r.remindBefore,
          label: new Date(r.customDate).toLocaleString(),
        };
      } else if (r.remindBefore > 168 && deadlineDate) {
        const reminderDate = new Date(
          deadlineDate.getTime() - r.remindBefore * 3600000
        );
        return { value: r.remindBefore, label: reminderDate.toLocaleString() };
      }
      return { value: r.remindBefore, label: formatHoursLabel(r.remindBefore) };
    });

  const toggleReminder = (value, checked) => {
    setTempReminders((prev) => {
      const existing = prev.find(
        (r) => !r.type && Math.abs(r.remindBefore - value) < 0.01
      );
      if (checked) {
        if (!existing) return [...prev, { remindBefore: value, sent: false }];
        return prev.map((r) =>
          !r.type && Math.abs(r.remindBefore - value) < 0.01 ? { ...r, sent: false } : r
        );
      }
      return prev.filter((r) => r.type || Math.abs(r.remindBefore - value) >= 0.01);
    });
  };

  const [customReminder, setCustomReminder] = useState("");
  const handleAddCustomReminder = () => {
    if (!customReminder) return;
    const selectedDate = new Date(customReminder);
    if (isNaN(selectedDate)) return;
    if (!deadlineDate || selectedDate >= deadlineDate) return;
    const hours = (deadlineDate - selectedDate) / (1000 * 60 * 60);
    if (hours > 0 && hours <= diffInHours) {
      setTempReminders((prev) => {
        if (!prev.some((r) => !r.type && Math.abs(r.remindBefore - hours) < 0.01)) {
          return [
            ...prev,
            {
              remindBefore: hours,
              sent: false,
              customDate: selectedDate.toISOString(),
            },
          ];
        }
        return prev;
      });
    }
    setCustomReminder("");
  };

  // State to control dropdown open/closed
  const [isOpen, setIsOpen] = useState(false);

  // Calculate how many daily and weekly reminders would be generated
  const maxDays = Math.floor(diffInHours / 24);
  const maxWeeks = Math.floor(diffInHours / (24 * 7));

  return (
    <div className="task-reminders-container">
      {/* Dropdown Header Bar */}
      <div className="reminders-dropdown" onClick={() => setIsOpen(!isOpen)}>
        <div className="reminders-dropdown-header">
          <h6>Reminders</h6>
          {isOpen ? (
            <i className="bi bi-chevron-up"></i>
          ) : (
            <i className="bi bi-chevron-down"></i>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-3">
          {/* Recurring Reminders Section */}
          {(maxDays > 0 || maxWeeks > 0) && (
            <div className="row mb-3">
              <div className="col-12">
                <label className="small fw-semibold d-block mb-2">
                  Recurring Reminders:
                </label>
                <div className="d-flex flex-wrap gap-3">
                  {maxDays > 0 && (
                    <div className="d-inline-block">
                      <label className="reminder-checkbox-label d-inline-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={hasDailyReminders}
                          onChange={(e) => toggleDailyReminders(e.target.checked)}
                        />
                        Every Day ({maxDays} reminder{maxDays !== 1 ? 's' : ''})
                      </label>
                    </div>
                  )}
                  {maxWeeks > 0 && (
                    <div className="d-inline-block">
                      <label className="reminder-checkbox-label d-inline-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input me-2"
                          checked={hasWeeklyReminders}
                          onChange={(e) => toggleWeeklyReminders(e.target.checked)}
                        />
                        Every Week ({maxWeeks} reminder{maxWeeks !== 1 ? 's' : ''})
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <label className="small fw-semibold d-block">
                Add Custom Reminder:
              </label>
              <div className="d-flex align-items-center gap-1 flex-wrap">
                <input
                  type="datetime-local"
                  className="form-control form-control-sm"
                  style={{ width: "220px" }}
                  value={customReminder}
                  onChange={(e) => setCustomReminder(e.target.value)}
                  min={formatDateTimeLocal(new Date().toISOString())}
                  max={
                    tempDeadline ? formatDateTimeLocal(tempDeadline) : undefined
                  }
                />
                <button
                  className={`btn btn-sm ${
                    theme === "dark" ? "btn-outline-light" : "btn-outline-dark"
                  }`}
                  onClick={handleAddCustomReminder}
                >
                  Add
                </button>
              </div>
            </div>
            <div className="col-12 col-md-6 mb-3">
              <label className="small fw-semibold d-block">
                One-time Reminders:
              </label>
              <div className="d-flex flex-wrap gap-2">
                {defaultIntervals.map((item) => {
                  const existing = tempReminders.find(
                    (r) => !r.type && Math.abs(r.remindBefore - item.value) < 0.01
                  );
                  const checked = existing ? !existing.sent : false;
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
          </div>
          {customIntervals.length > 0 && (
            <div className="row">
              <div className="col-12 mb-3">
                <label className="small fw-semibold d-block">
                  Custom One-time Reminders:
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {customIntervals.map((item) => {
                    const existing = tempReminders.find(
                      (r) => !r.type && Math.abs(r.remindBefore - item.value) < 0.01
                    );
                    const checked = existing ? !existing.sent : false;
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
            </div>
          )}
          
          {/* Show active recurring reminders summary */}
          {(hasDailyReminders || hasWeeklyReminders) && (
            <div className="row">
              <div className="col-12">
                <div className="alert alert-info py-2 px-3">
                  <small>
                    <strong>Active recurring reminders:</strong>
                    {hasDailyReminders && ` Daily reminders (${tempReminders.filter(r => r.type === 'daily').length} total)`}
                    {hasDailyReminders && hasWeeklyReminders && ', '}
                    {hasWeeklyReminders && ` Weekly reminders (${tempReminders.filter(r => r.type === 'weekly').length} total)`}
                  </small>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskReminders;