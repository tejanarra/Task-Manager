import React, { useState, useEffect, useRef, useCallback } from "react";
import { deleteTask, updateTask } from "../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import ConfirmationModal from "../ConfirmationModal";
import TaskReminders from "./TaskReminders";
import { formatRelativeTime, formatDateTimeLocal } from "../../utils/dateUtils";
import "./Styles/TaskItem.css";

const ALL_INTERVALS = [
  { value: 1, label: "1 hr" },
  { value: 24, label: "1 day" },
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
  isEditing = false,
  setIsEditing = () => {},
}) => {
  const [tempTitle, setTempTitle] = useState(task.title);
  const [tempDescription, setTempDescription] = useState(task.description);
  const [tempStatus, setTempStatus] = useState(task.status);
  const [tempDeadline, setTempDeadline] = useState(task.deadline || null);
  const [tempReminders, setTempReminders] = useState(
    Array.isArray(task.reminders) ? task.reminders : []
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);

  // Ensure reminders update when the AI-created task is previewed
  useEffect(() => {
    if (Array.isArray(task.reminders) && task.reminders.length > 0) {
      setTempReminders(task.reminders);
    }
  }, [task.reminders]);

  const handleCancel = useCallback(() => {
    setTempTitle(task.title);
    setTempDescription(task.description);
    setTempStatus(task.status);
    setTempDeadline(task.deadline || null);
    setTempReminders(Array.isArray(task.reminders) ? task.reminders : []);
    if (isNewTask) {
      onCancel(task.id);
    } else {
      setIsEditing(false);
    }
  }, [
    task.title,
    task.description,
    task.status,
    task.deadline,
    task.reminders,
    isNewTask,
    onCancel,
    task.id,
    setIsEditing,
  ]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isEditing && cardRef.current && !cardRef.current.contains(e.target)) {
        handleCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, handleCancel]);

  const handleSave = async () => {
    if (!tempTitle.trim() || !tempDescription.trim()) return;

    setIsLoading(true);

    const changed =
      tempTitle !== task.title ||
      tempDescription !== task.description ||
      tempStatus !== task.status ||
      tempDeadline !== task.deadline ||
      JSON.stringify(tempReminders) !== JSON.stringify(task.reminders);

    if (!changed && !isNewTask) {
      setIsEditing(false);
      setIsLoading(false);
      return;
    }

    const now = new Date();
    const deadlineDate = tempDeadline ? new Date(tempDeadline) : null;
    const diffInHours =
      deadlineDate && deadlineDate > now
        ? (deadlineDate - now) / (1000 * 60 * 60)
        : 0;

    const regenerateRecurringReminders = (reminders) => {
      const hasDaily = reminders.some((r) => r.type === "daily");
      const hasWeekly = reminders.some((r) => r.type === "weekly");

      let filteredReminders = reminders.filter(
        (r) =>
          (r.type === "one-time" || !r.type) && r.remindBefore <= diffInHours
      );

      if (hasDaily && diffInHours > 0) {
        const maxDays = Math.floor(diffInHours / 24);
        for (let day = 1; day <= maxDays; day++) {
          filteredReminders.push({
            remindBefore: day * 24,
            sent: false,
            type: "daily",
            dayNumber: day,
          });
        }
      }

      if (hasWeekly && diffInHours > 0) {
        const maxWeeks = Math.floor(diffInHours / (24 * 7));
        for (let week = 1; week <= maxWeeks; week++) {
          filteredReminders.push({
            remindBefore: week * 24 * 7,
            sent: false,
            type: "weekly",
            weekNumber: week,
          });
        }
      }

      return filteredReminders;
    };

    const finalReminders =
      diffInHours > 0 ? regenerateRecurringReminders(tempReminders) : [];

    const updatedTaskData = {
      title: tempTitle.trim(),
      description: tempDescription.trim(),
      status: tempStatus,
      deadline: tempDeadline ? deadlineDate.toISOString() : null,
      reminders: finalReminders,
    };

    try {
      if (isNewTask) {
        onSave({ ...task, ...updatedTaskData });
      } else {
        const response = await updateTask(task.id, updatedTaskData);
        setTasks((prev) =>
          prev.map((t) => (t.id === response.data.id ? response.data : t))
        );
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const getStripColor = (status) => {
    switch (status) {
      case "completed":
        return "#28a745";
      case "in-progress":
        return "#ffc107";
      default:
        return "#dc3545";
    }
  };

  const stripColor = getStripColor(isEditing ? tempStatus : task.status);
  const isDeadlineInFuture =
    tempDeadline && new Date(tempDeadline) > new Date();

  const getReminderSummary = () => {
    if (!tempReminders || tempReminders.length === 0) return null;

    const dailyCount = tempReminders.filter((r) => r.type === "daily").length;
    const weeklyCount = tempReminders.filter((r) => r.type === "weekly").length;
    const oneTimeCount = tempReminders.filter(
      (r) => r.type === "one-time" || !r.type
    ).length;

    const parts = [];
    if (dailyCount > 0) parts.push(`Daily (${dailyCount})`);
    if (weeklyCount > 0) parts.push(`Weekly (${weeklyCount})`);
    if (oneTimeCount > 0) parts.push(`One-time (${oneTimeCount})`);

    return parts.length > 0 ? parts.join(", ") : null;
  };

  const reminderSummary = getReminderSummary();

  const handleCardClick = (e) => {
    if (!isEditing && !isLoading && !e.target.closest('.reminder-indicator')) {
      setIsEditing(true);
    }
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`task-card ${theme === "dark" ? "dark-mode" : ""} ${
          isLoading ? "loading" : ""
        } ${isNewTask ? "new-task" : ""} ${isEditing ? "editing" : ""}`}
        onClick={handleCardClick}
      >
        <div
          className="task-strip"
          style={{ backgroundColor: stripColor }}
        ></div>

        <div className="task-card-content">
          {!isEditing && (
            <i
              className={`bi ${
                task.status === "completed"
                  ? "bi-check-circle-fill"
                  : task.status === "in-progress"
                  ? "bi-hourglass-split"
                  : "bi-circle"
              } status-icon`}
              style={{ color: stripColor }}
            />
          )}

          {isEditing ? (
            <div className="task-form-grid">
              <div className="task-form-group full-width">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  placeholder="Enter task title..."
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="task-form-group full-width">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  placeholder="Enter task description..."
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="task-form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={tempStatus}
                  onChange={(e) => setTempStatus(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
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
                  className="form-control"
                  value={tempDeadline ? formatDateTimeLocal(tempDeadline) : ""}
                  onChange={(e) => setTempDeadline(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {isDeadlineInFuture && (
                <div className="task-form-group full-width">
                  <TaskReminders
                    tempDeadline={tempDeadline}
                    tempReminders={tempReminders}
                    setTempReminders={setTempReminders}
                    theme={theme}
                    ALL_INTERVALS={ALL_INTERVALS}
                    formatHoursLabel={formatHoursLabel}
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

          <div className="task-metadata">
            <div className="task-metadata-item">
              <strong>Created</strong>
              <span>{formatRelativeTime(task.createdAt)}</span>
            </div>
            <div className="task-metadata-item">
              <strong>Deadline</strong>
              <span>
                {task.deadline
                  ? formatRelativeTime(task.deadline)
                  : "No deadline set"}
              </span>
            </div>
          </div>

          {isEditing && (
            <div className="task-actions">
              {!isNewTask && (
                <button
                  className={`btn ${
                    theme === "dark" ? "btn-outline-danger" : "btn-danger"
                  }`}
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              )}
              <button
                className={`btn ${
                  theme === "dark" ? "btn-outline-secondary" : "btn-secondary"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className={`btn ${
                  theme === "dark" ? "btn-outline-success" : "btn-success"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                disabled={
                  !tempTitle.trim() || !tempDescription.trim() || isLoading
                }
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          )}

          {!isEditing && reminderSummary && (
            <div
              className="reminder-indicator"
              title={`Reminders: ${reminderSummary}`}
              onClick={(e) => e.stopPropagation()}
            >
              <i className="bi bi-bell-fill"></i>
              <small>{reminderSummary}</small>
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