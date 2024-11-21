import React, { useState } from "react";
import { deleteTask, updateTask } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/AuthContext";

const TaskItem = ({ task, setTasks }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);
  const [newStatus, setNewStatus] = useState(task.status);
  const [newDescription, setNewDescription] = useState(task.description);
  const { logout } = useAuth();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (confirmed) {
      try {
        await deleteTask(task.id);
        setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const handleUpdate = async () => {
    const updatedTask = {
      title: newTitle,
      status: newStatus,
      description: newDescription,
    };

    try {
      const response = await updateTask(task.id, updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === response.data.id ? response.data : t))
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
      logout();
    }
  };

  const handleCancelEdit = () => {
    setNewTitle(task.title);
    setNewStatus(task.status);
    setNewDescription(task.description);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  if (date >= today) {
    return `Today at ${date.toLocaleTimeString()}`;
  }
  if (date >= yesterday) {
    return `Yesterday at ${date.toLocaleTimeString()}`;
  }
  return date.toLocaleString();
};

  const formattedDateTime = formatDate(task.createdAt);
  const updatedTime = formatDate(task.updatedAt);

  return (
    <div
      className="card mb-4 shadow-sm border-0"
      style={{
        fontFamily: "Poppins, sans-serif",
        backgroundColor: "#f9f9f9",
        transition: "transform 0.3s ease-in-out",
        borderRadius: "10px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div className="card-body">
        <div className="row d-flex justify-content-between align-items-start">
          <div className="col-12 col-md-10">
            <h5 className="fw-bold text-dark" style={{ fontSize: "1.2rem" }}>
              {task.title}
              <span> : </span>
              <span
                className={`badge ${
                  task.status === "completed"
                    ? "bg-success"
                    : task.status === "in-progress"
                    ? "bg-warning"
                    : "bg-secondary"
                }`}
                style={{
                  fontWeight: "500",
                  fontSize: "0.9rem",
                }}
              >
                {task.status}
              </span>
            </h5>
            <p className="text-muted mb-2" style={{ fontSize: "1rem" }}>
              {task.description}
            </p>
            <small
              className="text-muted"
              style={{
                fontSize: "0.875rem",
                fontStyle: "italic",
                color: "#888",
                display: "block",
                marginTop: "0.5rem",
              }}
            >
              <span style={{ fontWeight: "bold", color: "#666" }}>
                Created:
              </span>{" "}
              <span style={{ color: "#555" }}>{formattedDateTime}</span>
              <br />
              <span style={{ fontWeight: "bold", color: "#666" }}>
                Last Updated:
              </span>{" "}
              <span style={{ color: "#555" }}>{updatedTime}</span>
            </small>
          </div>
          <div
            className="col-12 col-md-2 d-flex flex-column justify-content-between"
            style={{ minHeight: "60px" }}
          >
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-light btn-sm mb-2"
                style={{
                  fontWeight: "500",
                  color: "#333",
                  backgroundColor: "#f0f0f0",
                }}
              >
                <i className="bi bi-pencil"></i> Edit
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                className="btn btn-secondary btn-sm mb-2"
                style={{
                  fontWeight: "500",
                }}
              >
                <i className="bi bi-x-circle"></i> Cancel
              </button>
            )}
            <button
              onClick={handleDelete}
              className="btn btn-light btn-sm"
              style={{
                fontWeight: "500",
                color: "#333",
                backgroundColor: "#f0f0f0",
              }}
            >
              <i className="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>

        {isEditing && (
          <div className="mt-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="form-control mb-2"
              style={{
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="form-control mb-2"
              style={{
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="form-select mb-2"
              style={{
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <div className="d-flex d-flex justify-content-end mt-2">
              <button
                onClick={handleUpdate}
                className="btn btn-light btn-sm"
                style={{
                  fontWeight: "500",
                  color: "#333",
                  backgroundColor: "#f0f0f0",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
