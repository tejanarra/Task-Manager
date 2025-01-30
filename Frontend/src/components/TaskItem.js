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

    const validIntervals = ALL_INTERVALS.filter((i) => i.value <= diffInHours);
    const finalReminders = tempReminders.filter(
      (r) => validIntervals.some((v) => v.value === r.remindBefore) && !r.sent
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

  const getAllowedIntervals = () => {
    if (!tempDeadline) return [];
    const now = new Date();
    const deadlineDate = new Date(tempDeadline);
    if (deadlineDate <= now) return [];
    const diffInHours = (deadlineDate - now) / (1000 * 60 * 60);
    return ALL_INTERVALS.filter((i) => i.value <= diffInHours);
  };

  const toggleReminder = (value, checked) => {
    setTempReminders((prev) => {
      const existing = prev.find((r) => r.remindBefore === value);
      if (checked) {
        if (!existing) {
          return [...prev, { remindBefore: value, sent: false }];
        } else {
          return prev.map((r) =>
            r.remindBefore === value ? { ...r, sent: false } : r
          );
        }
      } else {
        return prev.filter((r) => r.remindBefore !== value);
      }
    });
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
    return found ? found.label : `${maxVal} hrs`;
  };

  const largestReminder = isEditing ? null : getLargestNotSentReminder();

  const isDeadlineInFuture =
    tempDeadline && new Date(tempDeadline) > new Date();

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
                value={tempDeadline ? formatDateTimeLocal(tempDeadline) : null}
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
              <label className="form-label fw-semibold d-block">
                Reminders
              </label>
              {getAllowedIntervals().length === 0 ? (
                <small
                  className={`text-${theme === "dark" ? "light" : "muted"}`}
                >
                  No valid intervals.
                </small>
              ) : (
                <div className="d-flex flex-row flex-wrap gap-2">
                  {getAllowedIntervals().map((interval) => {
                    const existing = tempReminders.find(
                      (r) => r.remindBefore === interval.value
                    );
                    const checked = existing ? !existing.sent : false;
                    return (
                      <div key={interval.value}>
                        <label className="reminder-checkbox-label d-inline-flex align-items-center">
                          <input
                            type="checkbox"
                            className="form-check-input me-2"
                            checked={checked}
                            onChange={(e) =>
                              toggleReminder(interval.value, e.target.checked)
                            }
                          />
                          {interval.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
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
            <div className="mt-3 d-flex justify-content-end gap-3">
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
