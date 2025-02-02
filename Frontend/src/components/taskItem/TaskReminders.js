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

  // Default intervals (e.g. 1 hr, 1 day, 1 week)
  const defaultIntervals = ALL_INTERVALS.filter((i) => i.value <= diffInHours);

  // Custom reminders: if added via the datetime-local input, they store a customDate.
  const customIntervals = tempReminders
    .filter(
      (r) =>
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
        (r) => Math.abs(r.remindBefore - value) < 0.01
      );
      if (checked) {
        if (!existing) return [...prev, { remindBefore: value, sent: false }];
        return prev.map((r) =>
          Math.abs(r.remindBefore - value) < 0.01 ? { ...r, sent: false } : r
        );
      }
      return prev.filter((r) => Math.abs(r.remindBefore - value) >= 0.01);
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
        if (!prev.some((r) => Math.abs(r.remindBefore - hours) < 0.01)) {
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

  // Determine column classes for the first row:
  // Left column always takes default intervals,
  // Right column always takes custom reminder input.
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
          <div className="row">
            <div className="col-12 col-md-6 mb-3">
              <label className="small fw-semibold d-block">
                Add Custom Reminder:
              </label>
              <div className="d-flex align-items-center gap-2">
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
                Remind Before:
              </label>
              <div className="d-flex flex-wrap gap-2">
                {defaultIntervals.map((item) => {
                  const existing = tempReminders.find(
                    (r) => Math.abs(r.remindBefore - item.value) < 0.01
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
                  Custom Reminders:
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {customIntervals.map((item) => {
                    const existing = tempReminders.find(
                      (r) => Math.abs(r.remindBefore - item.value) < 0.01
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
        </div>
      )}
    </div>
  );
};

export default TaskReminders;
