import React, { useState, useEffect, useRef, useCallback } from "react";
import { deleteTask, updateTask } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import ConfirmationModal from "./ConfirmationModal";
import { formatRelativeTime } from "../utils/dateUtils";
import "../Styles/TaskItem.css";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const cardRef = useRef(null);

  const handleCancel = useCallback(() => {
    setTempTitle(task.title);
    setTempDescription(task.description);
    setTempStatus(task.status);
    if (isNewTask) {
      onCancel(task.id);
    } else {
      setIsEditing(false);
    }
  }, [task.title, task.description, task.status, isNewTask, onCancel, task.id]);

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
    if (tempTitle.trim() === "" || tempDescription.trim() === "") {
      return;
    }

    if (
      tempTitle !== task.title ||
      tempDescription !== task.description ||
      tempStatus !== task.status
    ) {
      if (isNewTask) {
        onSave({
          ...task,
          title: tempTitle.trim(),
          description: tempDescription.trim(),
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
      case "not-started":
      default:
        return "#a00000";
    }
  };

  const stripColor = getStripColor(task.status);

  return (
    <>
      <div
        ref={cardRef}
        className="task-card mb-4 position-relative"
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

          <div className="d-flex justify-content-between align-items-start flex-nowrap mb-2">
            {!isEditing ? (
              <>
                <h5
                  className="fw-bold mb-1 task-title"
                  style={{ color: stripColor }}
                >
                  {task.title}
                </h5>
              </>
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
              className="task-description"
              style={{
                whiteSpace: "pre-wrap",
                marginBottom: "1rem",
                fontSize: "1.25rem",
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
          <div className="d-flex flex-column flex-md-row small mt-2">
            <div>
              <strong>Created:</strong> {formatRelativeTime(task.createdAt)}
            </div>
            <div className="mt-1 mt-md-0 ms-md-3">
              <strong>Updated:</strong> {formatRelativeTime(task.updatedAt)}
            </div>
          </div>
          {isEditing && (
            <div className="d-flex justify-content-between align-items-center mt-3">
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
              {theme === "dark" ? (
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
              ) : (
                <button
                  className="btn btn-sm btn-dark"
                  style={{ borderRadius: "6px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  disabled={!tempTitle.trim() || !tempDescription.trim()}
                >
                  Save
                </button>
              )}
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
