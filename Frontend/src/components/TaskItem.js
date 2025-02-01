import React, { useState, useEffect, useRef, useCallback } from "react";
import { deleteTask, updateTask } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import ConfirmationModal from "./ConfirmationModal";
import { formatRelativeTime, formatDateTimeLocal } from "../utils/dateUtils";
import "../Styles/TaskItem.css";

const ALL_INTERVALS = [
  { value: 1, label: "1 hr" },
  { value: 6, label: "6 hrs" },
  { value: 12, label: "12 hrs" },
  { value: 24, label: "1 day" },
  { value: 48, label: "2 days" },
  { value: 168, label: "1 week" },
];

function formatHoursLabel(h) {
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (Number.isInteger(h)) return `${h} hr${h > 1 ? "s" : ""}`;
  return `${h} hrs`;
}

const TaskItem = ({
  theme,
  task,
  setTasks,
  isNewTask = false,
  onSave = () => {},
  onCancel = () => {},
}) => {
  const [isEditing, setIsEditing] = useState(isNewTask);
  const [tempTitle, setTempTitle] = useState(task.title);
  const [tempDescription, setTempDescription] = useState(task.description);
  const [tempStatus, setTempStatus] = useState(task.status);
  const [tempDeadline, setTempDeadline] = useState(task.deadline || null);
  const [tempReminders, setTempReminders] = useState(
    Array.isArray(task.reminders) ? task.reminders : []
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const cardRef = useRef(null);

  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState("minutes");

  const handleCancel = useCallback(() => {
    setTempTitle(task.title);
    setTempDescription(task.description);
    setTempStatus(task.status);
    setTempDeadline(task.deadline || null);
    setTempReminders(Array.isArray(task.reminders) ? task.reminders : []);
    if (isNewTask) onCancel(task.id);
    else setIsEditing(false);
  }, [
    task.title,
    task.description,
    task.status,
    task.deadline,
    task.reminders,
    isNewTask,
    onCancel,
    task.id,
  ]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isEditing && cardRef.current && !cardRef.current.contains(e.target)) {
        handleCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, handleCancel]);

  const handleSave = async () => {
    if (!tempTitle.trim() || !tempDescription.trim()) return;
    const changed =
      tempTitle !== task.title ||
      tempDescription !== task.description ||
      tempStatus !== task.status ||
      tempDeadline !== task.deadline ||
      JSON.stringify(tempReminders) !== JSON.stringify(task.reminders);

    if (!changed && !isNewTask) {
      setIsEditing(false);
      return;
    }

    const now = new Date();
    const deadlineDate = tempDeadline ? new Date(tempDeadline) : null;
    const diffInHours =
      deadlineDate && deadlineDate > now
        ? (deadlineDate - now) / (1000 * 60 * 60)
        : 0;

    const finalReminders = tempReminders.filter(
      (r) => r.remindBefore <= diffInHours && !r.sent
    );

    const updatedTaskData = {
      title: tempTitle.trim(),
      description: tempDescription.trim(),
      status: tempStatus,
      deadline: tempDeadline ? deadlineDate.toISOString() : null,
      reminders: finalReminders,
    };

    if (isNewTask) {
      onSave({ ...task, ...updatedTaskData });
    } else {
      try {
        const response = await updateTask(task.id, updatedTaskData);
        setTasks((prev) =>
          prev.map((t) => (t.id === response.data.id ? response.data : t))
        );
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting task:", error);
      setShowDeleteModal(false);
    }
  };

  const getStripColor = (status) => {
    switch (status) {
      case "completed":
        return "#007a00";
      case "in-progress":
        return "#daa520";
      default:
        return "#a00000";
    }
  };

  const stripColor = getStripColor(task.status);

  const getLargestNotSentReminder = () => {
    if (!task.reminders || !task.reminders.length) return null;
    const notSent = task.reminders.filter((r) => !r.sent);
    if (!notSent.length) return null;
    const maxVal = Math.max(...notSent.map((r) => r.remindBefore));
    const found = ALL_INTERVALS.find((i) => i.value === maxVal);
    if (found) return found.label;
    return formatHoursLabel(maxVal);
  };

  const largestReminder = isEditing ? null : getLargestNotSentReminder();

  const isDeadlineInFuture =
    tempDeadline && new Date(tempDeadline) > new Date();

  const getDisplayIntervals = () => {
    if (!tempDeadline) return [];
    const now = new Date();
    const deadlineDate = new Date(tempDeadline);
    if (deadlineDate <= now) return [];
    const diffInHours = (deadlineDate - now) / (1000 * 60 * 60);

    const builtIn = ALL_INTERVALS.filter((i) => i.value <= diffInHours);
    const custom = tempReminders
      .filter((r) => !ALL_INTERVALS.some((ai) => ai.value === r.remindBefore))
      .filter((r) => r.remindBefore <= diffInHours)
      .map((r) => ({
        value: r.remindBefore,
        label: formatHoursLabel(r.remindBefore),
      }));

    const combined = [...builtIn, ...custom];
    const uniqueMap = new Map();
    combined.forEach((item) => {
      if (!uniqueMap.has(item.value)) {
        uniqueMap.set(item.value, item.label);
      }
    });
    const final = Array.from(uniqueMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.value - b.value);

    return final;
  };

  const toggleReminder = (value, checked) => {
    setTempReminders((prev) => {
      const existing = prev.find((r) => r.remindBefore === value);
      if (checked) {
        if (!existing) {
          return [...prev, { remindBefore: value, sent: false }];
        }
        return prev.map((r) =>
          r.remindBefore === value ? { ...r, sent: false } : r
        );
      }
      return prev.filter((r) => r.remindBefore !== value);
    });
  };

  const handleAddCustomReminder = () => {
    if (!customValue || isNaN(customValue)) return;
    const numeric = parseFloat(customValue);
    if (numeric <= 0) return;

    let hours = 0;
    if (customUnit === "minutes") hours = numeric / 60;
    else if (customUnit === "hours") hours = numeric;
    else hours = numeric * 24;

    const now = new Date();
    const deadlineDate = tempDeadline ? new Date(tempDeadline) : null;
    const diffInHours =
      deadlineDate && deadlineDate > now
        ? (deadlineDate - now) / (1000 * 60 * 60)
        : 0;

    if (hours <= diffInHours) {
      setTempReminders((prev) => {
        if (!prev.some((r) => r.remindBefore === hours)) {
          return [...prev, { remindBefore: hours, sent: false }];
        }
        return prev;
      });
    }
    setCustomValue("");
  };

  const getAllowedUnits = () => {
    if (!isDeadlineInFuture) return ["minutes"]; 
    const now = new Date();
    const deadlineDate = new Date(tempDeadline);
    const diffInHours = (deadlineDate - now) / (1000 * 60 * 60);

    const allowed = ["minutes"]; 
    if (diffInHours >= 1) {
      allowed.push("hours");
      if (diffInHours >= 24) {
        allowed.push("days");
      }
    }
    return allowed;
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`task-card mb-4 position-relative ${
          theme === "dark" ? "dark-mode" : ""
        }`}
        onClick={() => setIsEditing(true)}
      >
        <div
          className="task-strip"
          style={{ backgroundColor: stripColor }}
        ></div>
        <div className="flex-grow-1 p-3 position-relative">
          {!isEditing && (
            <i
              className={`bi ${
                task.status === "completed"
                  ? "bi-check-circle"
                  : task.status === "in-progress"
                  ? "bi-hourglass"
                  : "bi-ban"
              } status-icon`}
              style={{ color: stripColor }}
            />
          )}

          {!isEditing ? (
            <h5
              className="fw-bold mb-2 task-title"
              style={{ color: stripColor }}
            >
              {task.title}
            </h5>
          ) : (
            <div className="mb-3">
              <label className="form-label fw-semibold">Title</label>
              <input
                type="text"
                className="form-control"
                style={{ borderRadius: "6px" }}
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {isEditing && (
            <div className="mb-3">
              <label className="form-label fw-semibold">Deadline</label>
              <input
                type="datetime-local"
                className="form-control"
                style={{ borderRadius: "6px" }}
                value={tempDeadline ? formatDateTimeLocal(tempDeadline) : ""}
                onChange={(e) => setTempDeadline(e.target.value)}
              />
            </div>
          )}

          {!isEditing ? (
            <p
              className="task-description"
              style={{ whiteSpace: "pre-wrap", fontSize: "1.15rem" }}
            >
              {task.description}
            </p>
          ) : (
            <div className="mb-3">
              <label className="form-label fw-semibold">Description</label>
              <textarea
                className="form-control"
                rows={3}
                style={{ borderRadius: "6px" }}
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
              />
            </div>
          )}

          {isEditing && (
            <div className="mb-3">
              <label className="form-label fw-semibold">Status</label>
              <select
                className="form-select"
                style={{ borderRadius: "6px" }}
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          {isEditing && isDeadlineInFuture && (
            <div className="mb-3">
              <label className="form-label fw-semibold d-block">Remind Before</label>
              {(() => {
                const intervals = getDisplayIntervals();
                if (intervals.length > 0) {
                  return (
                    <div
                      className="d-flex flex-row flex-wrap gap-2 mb-2"
                      style={{ overflowX: "auto", whiteSpace: "nowrap" }}
                    >
                      {intervals.map((item) => {
                        const existing = tempReminders.find(
                          (r) => r.remindBefore === item.value
                        );
                        const checked = existing ? !existing.sent : false;
                        return (
                          <div key={item.value} className="d-inline-block">
                            <label className="reminder-checkbox-label d-inline-flex align-items-center">
                              <input
                                type="checkbox"
                                className="form-check-input me-2"
                                checked={checked}
                                onChange={(e) =>
                                  toggleReminder(item.value, e.target.checked)
                                }
                              />
                              {item.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              })()}

              <div
                className="d-flex flex-row flex-nowrap align-items-center gap-2"
                style={{ overflowX: "auto", whiteSpace: "nowrap" }}
              >
                <span className="small fw-semibold mb-0">Custom:</span>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min="1"
                  style={{ width: "65px", borderRadius: "6px" }}
                  placeholder="Value"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                />
                <select
                  className="form-select form-select-sm"
                  style={{ width: "65px", borderRadius: "6px" }}
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                >
                  {getAllowedUnits().includes("minutes") && (
                    <option value="minutes">Min</option>
                  )}
                  {getAllowedUnits().includes("hours") && (
                    <option value="hours">Hrs</option>
                  )}
                  {getAllowedUnits().includes("days") && (
                    <option value="days">Days</option>
                  )}
                </select>
                <button
                  className={`btn btn-sm ${
                    theme === "dark" ? "btn-outline-light" : "btn-outline-dark"
                  }`}
                  style={{
                    borderRadius: "6px",
                    padding: "0.25rem 0.5rem",
                    minWidth: "50px",
                  }}
                  onClick={handleAddCustomReminder}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="d-flex flex-column flex-md-row small mt-3">
            <div>
              <strong>Created:</strong> {formatRelativeTime(task.createdAt)}
            </div>
            <div className="mt-1 mt-md-0 ms-md-3">
              <strong>Deadline:</strong>{" "}
              {task.deadline
                ? formatRelativeTime(task.deadline)
                : "No deadline set"}
            </div>
          </div>

          {isEditing && (
            <div className="mt-2 d-flex flex-row justify-content-end align-items-center gap-2">
              {!isNewTask && (
                <button
                  className={`btn btn-sm ${
                    theme === "dark" ? "btn-outline-danger" : "btn-secondary"
                  }`}
                  style={{ borderRadius: "6px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  Delete
                </button>
              )}
              <button
                className={`btn btn-sm ${
                  theme === "dark" ? "btn-outline-light" : "btn-dark"
                }`}
                style={{ borderRadius: "6px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={!tempTitle.trim() || !tempDescription.trim()}
              >
                Save
              </button>
            </div>
          )}

          {!isEditing && largestReminder && (
            <div className="reminder-indicator">
              <i className="bi bi-clock me-1"></i>
              {largestReminder}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        theme={theme}
        show={showDeleteModal}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
};

export default TaskItem;