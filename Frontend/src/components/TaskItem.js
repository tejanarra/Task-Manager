import React, { useState, useEffect, useRef } from "react";
import { deleteTask, updateTask } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

const TaskItem = ({
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
  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isEditing && cardRef.current && !cardRef.current.contains(e.target)) {
        if (isNewTask) {
          onCancel(task.id);
        } else {
          handleSave();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const handleSave = async () => {
    if (
      tempTitle !== task.title ||
      tempDescription !== task.description ||
      tempStatus !== task.status
    ) {
      if (isNewTask) {
        onSave({
          ...task,
          title: tempTitle,
          description: tempDescription,
          status: tempStatus,
        });
      } else {
        const updatedTask = {
          title: tempTitle.trim(),
          description: tempDescription.trim(),
          status: tempStatus,
        };
        try {
          const response = await updateTask(task.id, updatedTask);
          setTasks((prev) =>
            prev.map((t) => (t.id === response.data.id ? response.data : t))
          );
          setIsEditing(false);
        } catch (error) {
          console.error("Error updating task:", error);
        }
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getStripColor = (status) => {
    switch (status) {
      case "completed":
        return "#198754";
      case "in-progress":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  const stripColor = getStripColor(task.status);

  return (
    <div
      ref={cardRef}
      className="mb-4 shadow-sm d-flex position-relative"
      style={{
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #dee2e6",
        cursor: "pointer",
        transition: "transform 0.2s ease",
        fontFamily: "Poppins, sans-serif",
      }}
      onClick={() => setIsEditing(true)}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div style={{ width: "8px", backgroundColor: stripColor }} />
      <div className="flex-grow-1 p-3">
        <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
          {!isEditing ? (
            <h5 className="fw-bold mb-1" style={{ fontSize: "1.2rem" }}>
              {task.title}
            </h5>
          ) : (
            <div className="w-100 mb-3">
              <label className="form-label fw-semibold">Title</label>
              <input
                type="text"
                className="form-control w-100"
                style={{ borderRadius: "6px" }}
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>
        {!isEditing ? (
          <p
            style={{
              whiteSpace: "pre-wrap",
              marginBottom: "1rem",
              fontSize: "0.95rem",
            }}
          >
            {task.description}
          </p>
        ) : (
          <div className="w-100 mb-3">
            <label className="form-label fw-semibold">Description</label>
            <textarea
              className="form-control w-100"
              rows={3}
              style={{ borderRadius: "6px" }}
              value={tempDescription}
              onChange={(e) => setTempDescription(e.target.value)}
            />
          </div>
        )}
        {isEditing && (
          <div className="w-100 mb-3">
            <label className="form-label fw-semibold">Status</label>
            <select
              className="form-select w-100"
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
        <small style={{ color: "#666" }}>
          <strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}{" "}
          | <strong>Updated:</strong>{" "}
          {new Date(task.updatedAt).toLocaleString()}
        </small>
        {isEditing && (
          <div className="d-flex justify-content-end align-items-center mt-3 gap-2">
            <button
              className="btn btn-sm btn-success"
              style={{ borderRadius: "6px" }}
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
            >
              Save
            </button>
            <button
              className="btn btn-sm btn-danger"
              style={{ borderRadius: "6px" }}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
