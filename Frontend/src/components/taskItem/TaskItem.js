import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  deleteTask,
  updateTask,
  updateTaskReminders,
} from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import ConfirmationModal from "../ConfirmationModal";
import TaskReminders from "./TaskReminders";
import { formatRelativeTime, formatDateTimeLocal } from "../../utils/dateUtils";
import "./Styles/TaskItem.css";

// Presets (1h, 1d, 1w)
const ALL_INTERVALS = [
  { value: 1, label: "1 hr" },
  { value: 24, label: "1 day" },
  { value: 168, label: "1 week" },
];

// 🔁 UI -> backend: enforce correct enum values
const normalizeStatusForBackend = (value) => {
  switch (value) {
    case "in-progress":
      return "IN_PROGRESS";
    case "completed":
      return "COMPLETED";
    default:
      return "NOT_STARTED";
  }
};

// ✅ Convert UI reminders → backend format
const toBackendReminders = (uiReminders, deadlineUTC) => {
  const deadline = deadlineUTC ? new Date(deadlineUTC) : null;
  if (!deadline) return [];

  const result = [];

  uiReminders.forEach((r) => {
    // Recurring
    if (r.type === "daily") {
      result.push({
        type: "DAILY",
        triggerAtUTC: null,
        hourOfDayUTC: r.hourOfDayUTC, // 0-23 UTC hour
        dayOfWeek: null,
      });
      return;
    }

    if (r.type === "weekly") {
      result.push({
        type: "WEEKLY",
        triggerAtUTC: null,
        hourOfDayUTC: r.hourOfDayUTC,
        dayOfWeek: r.dayOfWeek, // 0-6 UTC weekday
      });
      return;
    }

    // One-time reminders
    if (typeof r.remindBefore === "number") {
      const triggerMs = deadline.getTime() - r.remindBefore * 3600 * 1000;
      result.push({
        type: "ONE_TIME",
        triggerAtUTC: new Date(triggerMs).toISOString(),
        hourOfDayUTC: null,
        dayOfWeek: null,
      });
      return;
    }

    // Custom absolute datetime reminder
    if (r.customDate) {
      result.push({
        type: "ONE_TIME",
        triggerAtUTC: new Date(r.customDate).toISOString(),
        hourOfDayUTC: null,
        dayOfWeek: null,
      });
    }
  });

  return result;
};

const TaskItem = ({ theme, task, setTasks, isNewTask, onSave, onCancel }) => {
  const [isEditing, setIsEditing] = useState(isNewTask);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [tempTitle, setTempTitle] = useState(task.title);
  const [tempDescription, setTempDescription] = useState(task.description);
  const [tempStatus, setTempStatus] = useState(task.status || "not-started");
  const [tempDeadline, setTempDeadline] = useState(task.deadlineUTC || null);
  const [tempReminders, setTempReminders] = useState(
    Array.isArray(task.reminders) ? task.reminders : []
  );

  const cardRef = useRef(null);

  const handleCancel = useCallback(() => {
    setTempTitle(task.title);
    setTempDescription(task.description);
    setTempStatus(task.status || "not-started");
    setTempDeadline(task.deadlineUTC || null);
    setTempReminders(Array.isArray(task.reminders) ? task.reminders : []);
    isNewTask ? onCancel(task.id) : setIsEditing(false);
  }, [task, isNewTask, onCancel]);

  // ✅ Click-outside cancel only for editing existing tasks
  useEffect(() => {
    const handler = (e) => {
      if (
        isEditing &&
        !isNewTask &&
        cardRef.current &&
        !cardRef.current.contains(e.target)
      ) {
        handleCancel();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isEditing, handleCancel, isNewTask]);

  const stripColor =
    tempStatus === "completed"
      ? "#007a00"
      : tempStatus === "in-progress"
      ? "#daa520"
      : "#a00000";

  const isDeadlineValid = tempDeadline && new Date(tempDeadline) > new Date();

  const getReminderSummary = () => {
    if (!tempReminders?.length) return null;
    const daily = tempReminders.filter((r) => r.type === "daily").length;
    const weekly = tempReminders.filter((r) => r.type === "weekly").length;
    const once = tempReminders.filter((r) => !r.type).length;
    return [
      daily > 0 ? `Daily (${daily})` : null,
      weekly > 0 ? `Weekly (${weekly})` : null,
      once > 0 ? `One-time (${once})` : null,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const reminderSummary = getReminderSummary();

  const handleSave = async () => {
    if (!tempTitle.trim() || !tempDescription.trim()) return;

    setIsLoading(true);

    const deadlineISO = tempDeadline
      ? new Date(tempDeadline).toISOString()
      : null;

    const updatedFields = {
      title: tempTitle.trim(),
      description: tempDescription.trim(),
      status: normalizeStatusForBackend(tempStatus),
      deadlineUTC: deadlineISO,
    };

    const formattedReminders = deadlineISO
      ? toBackendReminders(tempReminders, deadlineISO)
      : [];

    try {
      if (isNewTask) {
        // Parent creates task, then reminders patched
        onSave({
          ...task,
          ...updatedFields,
          reminders: formattedReminders,
        });
        setIsEditing(false);
      } else {
        // Existing task flow
        const updated = await updateTask(task.id, updatedFields);
        await updateTaskReminders(task.id, formattedReminders);

        const finalTask = {
          ...updated.data,
          reminders: formattedReminders,
        };

        setTasks((prev) => prev.map((t) => (t.id === task.id ? finalTask : t)));
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Task update failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await deleteTask(task.id);
      setTasks((p) => p.filter((t) => t.id !== task.id));
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`task-card ${theme === "dark" ? "dark-mode" : ""} ${
          isLoading ? "loading" : ""
        } ${isNewTask ? "new-task" : ""}`}
        onClick={() => !isEditing && setIsEditing(true)}
      >
        <div className="task-strip" style={{ backgroundColor: stripColor }} />

        <div className="task-card-content">
          {!isEditing && (
            <i
              className={`bi ${
                tempStatus === "completed"
                  ? "bi-check-circle"
                  : tempStatus === "in-progress"
                  ? "bi-hourglass"
                  : "bi-ban"
              } status-icon`}
              style={{ color: stripColor }}
            />
          )}

          {isEditing ? (
            <div className="task-form-grid">
              <div className="task-form-group full-width">
                <label className="form-label">Title</label>
                <input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="task-form-group full-width">
                <label className="form-label">Description</label>
                <textarea
                  rows={3}
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="task-form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={tempStatus}
                  onChange={(e) => setTempStatus(e.target.value)}
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="task-form-group">
                <label className="form-label">Deadline</label>
                <input
                  type="datetime-local"
                  value={tempDeadline ? formatDateTimeLocal(tempDeadline) : ""}
                  onChange={(e) => setTempDeadline(e.target.value)}
                  className="form-control"
                />
              </div>

              {isDeadlineValid && (
                <div className="task-form-group full-width">
                  <TaskReminders
                    tempDeadline={tempDeadline}
                    tempReminders={tempReminders}
                    setTempReminders={setTempReminders}
                    theme={theme}
                    ALL_INTERVALS={ALL_INTERVALS}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <h5 className="task-title" style={{ color: stripColor }}>
                {tempTitle}
              </h5>
              <p className="task-description">{tempDescription}</p>
            </>
          )}

          {/* Metadata display */}
          <div className="task-metadata">
            <div className="task-metadata-item">
              <strong>Created</strong>
              <span>{formatRelativeTime(task.createdAt)}</span>
            </div>
            <div className="task-metadata-item">
              <strong>Deadline</strong>
              <span>
                {task.deadlineUTC
                  ? formatRelativeTime(task.deadlineUTC)
                  : "No deadline"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="task-actions">
              {!isNewTask && (
                <button
                  className="btn btn-outline-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              )}
              <button
                className="btn btn-dark"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={isLoading || !tempTitle.trim()}
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          )}

          {!isEditing && reminderSummary && (
            <div className="reminder-indicator">
              <i className="bi bi-clock" /> <small>{reminderSummary}</small>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmationModal
        theme={theme}
        show={showDeleteModal}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
};

export default TaskItem;
