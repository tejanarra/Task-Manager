import React from "react";
import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../utils/dateUtils";
import "./Styles/TaskCard.css";

const TaskCard = ({ theme, task }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/tasks/${task.id}/edit`);
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

  const getReminderSummary = () => {
    if (!task.reminders || task.reminders.length === 0) return null;

    const dailyCount = task.reminders.filter((r) => r.type === "daily").length;
    const weeklyCount = task.reminders.filter((r) => r.type === "weekly").length;
    const oneTimeCount = task.reminders.filter(
      (r) => r.type === "one-time" || !r.type
    ).length;

    const parts = [];
    if (dailyCount > 0) parts.push(`Daily (${dailyCount})`);
    if (weeklyCount > 0) parts.push(`Weekly (${weeklyCount})`);
    if (oneTimeCount > 0) parts.push(`One-time (${oneTimeCount})`);

    return parts.length > 0 ? parts.join(", ") : null;
  };

  const reminderSummary = getReminderSummary();

  return (
    <div
      className={`task-card ${theme === "dark" ? "dark" : ""}`}
      onClick={handleClick}
    >
      <div
        className="task-strip"
        style={{ backgroundColor: stripColor }}
      ></div>

      <div className="task-card-content">
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

        <h5 className="task-title" style={{ color: stripColor }}>
          {task.title}
        </h5>
        <p className="task-description">{task.description}</p>

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

        {reminderSummary && (
          <div
            className="reminder-indicator"
            title={`Reminders: ${reminderSummary}`}
          >
            <i className="bi bi-clock"></i>
            <small>{reminderSummary}</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;