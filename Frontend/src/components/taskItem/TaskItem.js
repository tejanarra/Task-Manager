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

  const handleCancel = useCallback(() => {
    setTempTitle(task.title);
    setTempDescription(task.description);
    setTempStatus(task.status);
    setTempDeadline(task.deadline || null);
    setTempReminders(Array.isArray(task.reminders) ? task.reminders : []);
    isNewTask ? onCancel(task.id) : setIsEditing(false);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

    // Helper function to regenerate recurring reminders when deadline changes
    const regenerateRecurringReminders = (reminders) => {
      const hasDaily = reminders.some(r => r.type === 'daily');
      const hasWeekly = reminders.some(r => r.type === 'weekly');
      
      // Keep non-recurring reminders that are still valid
      let filteredReminders = reminders.filter(r => 
        !r.type && r.remindBefore <= diffInHours
      );

      // Regenerate daily reminders if they were enabled
      if (hasDaily && diffInHours > 0) {
        const maxDays = Math.floor(diffInHours / 24);
        for (let day = 1; day <= maxDays; day++) {
          const hoursBeforeDeadline = day * 24;
          filteredReminders.push({
            remindBefore: hoursBeforeDeadline,
            sent: false,
            type: 'daily',
            dayNumber: day
          });
        }
      }

      // Regenerate weekly reminders if they were enabled
      if (hasWeekly && diffInHours > 0) {
        const maxWeeks = Math.floor(diffInHours / (24 * 7));
        for (let week = 1; week <= maxWeeks; week++) {
          const hoursBeforeDeadline = week * 24 * 7;
          filteredReminders.push({
            remindBefore: hoursBeforeDeadline,
            sent: false,
            type: 'weekly',
            weekNumber: week
          });
        }
      }

      return filteredReminders;
    };

    // Process reminders based on new deadline
    let finalReminders;
    if (diffInHours > 0) {
      // If there's a valid deadline, regenerate recurring reminders
      finalReminders = regenerateRecurringReminders(tempReminders);
    } else {
      // If no deadline or deadline is in the past, remove all reminders
      finalReminders = [];
    }

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

  const handleDelete = () => setShowDeleteModal(true);
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
  const isDeadlineInFuture =
    tempDeadline && new Date(tempDeadline) > new Date();

  // Helper function to get reminder summary for display
  const getReminderSummary = () => {
    if (!tempReminders || tempReminders.length === 0) return null;
    
    const dailyCount = tempReminders.filter(r => r.type === 'daily').length;
    const weeklyCount = tempReminders.filter(r => r.type === 'weekly').length;
    const oneTimeCount = tempReminders.filter(r => !r.type).length;
    
    const parts = [];
    if (dailyCount > 0) parts.push(`Daily (${dailyCount})`);
    if (weeklyCount > 0) parts.push(`Weekly (${weeklyCount})`);
    if (oneTimeCount > 0) parts.push(`One-time (${oneTimeCount})`);
    
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const reminderSummary = getReminderSummary();

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
          {isEditing ? (
            <div className="mb-3">
              <label className="form-label fw-semibold">Title</label>
              <input
                type="text"
                className="form-control"
                style={{ borderRadius: "6px" }}
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
              />
            </div>
          ) : (
            <h5
              className="fw-bold mb-2 task-title"
              style={{ color: stripColor }}
            >
              {tempTitle}
            </h5>
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
          {isEditing ? (
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
          ) : (
            <p
              className="task-description"
              style={{ whiteSpace: "pre-wrap", fontSize: "1.15rem" }}
            >
              {tempDescription}
            </p>
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
            <TaskReminders
              tempDeadline={tempDeadline}
              tempReminders={tempReminders}
              setTempReminders={setTempReminders}
              theme={theme}
              ALL_INTERVALS={ALL_INTERVALS}
              formatHoursLabel={formatHoursLabel}
            />
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
          {!isEditing && reminderSummary && (
            <div className="reminder-indicator" title={`Reminders: ${reminderSummary}`}>
              <i className="bi bi-clock"></i>
              <small className="ms-1">{reminderSummary}</small>
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