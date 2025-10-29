import React from "react";
import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/dateUtils";
import { getStatusColor } from "../../../utils/statusUtils";
import { getReminderSummary } from "../../../utils/reminderUtils";
import "./Styles/TaskCard.css";

const TaskCard = ({ theme, task, demoMode = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!demoMode) {
      navigate(`/tasks/${task.id}/edit`);
    }
  };

  const stripColor = getStatusColor(task.status);
  const reminderSummary = getReminderSummary(task.reminders);

  return (
    <div
      className={`task-card ${theme === "dark" ? "dark" : ""}`}
      onClick={handleClick}
    >
      <div className="task-strip" style={{ backgroundColor: stripColor }}></div>

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
