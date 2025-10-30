import  { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createTask,
  updateTask,
  deleteTask,
  fetchTaskById,
} from "../../services/api";
import TaskReminders from "./taskItem/TaskReminders";
import ConfirmationModal from "../layout/ConfirmationModal";
import { formatDateTimeLocal } from "../../utils/dateUtils";
import "./TaskEditor.css";
import { REMINDER_INTERVALS } from "../../constants/appConstants";

const TaskEditor = ({ theme }) => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const isNewTask = taskId === "new";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("not-started");
  const [deadline, setDeadline] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState(null);

  // Load task data if editing
  useEffect(() => {
    const loadTask = async () => {
      if (!isNewTask) {
        try {
          setIsLoading(true);
          const response = await fetchTaskById(taskId);
          const task = response.data;

          if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setStatus(task.status);
            setDeadline(task.deadline || null);
            setReminders(Array.isArray(task.reminders) ? task.reminders : []);
          } else {
            setError("Task not found");
            setTimeout(() => navigate("/tasks"), 2000);
          }
        } catch (err) {
          console.error("Error loading task:", err);
          setError("Failed to load task");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTask();
  }, [taskId, isNewTask, navigate]);

  // Load task from navigation state (for AI-generated tasks)
  useEffect(() => {
    const state = window.history.state?.usr;
    if (state?.task) {
      const task = state.task;
      setTitle(task.title || "");
      setDescription(task.description || "");
      setStatus(task.status || "not-started");
      setDeadline(task.deadline || null);
      setReminders(Array.isArray(task.reminders) ? task.reminders : []);
    }
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    const now = new Date();
    const deadlineDate = deadline ? new Date(deadline) : null;
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
      diffInHours > 0 ? regenerateRecurringReminders(reminders) : [];

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status,
      deadline: deadline ? deadlineDate.toISOString() : null,
      reminders: finalReminders,
    };

    try {
      if (isNewTask) {
        await createTask({ ...taskData, priority: 1 });
      } else {
        await updateTask(taskId, taskData);
      }
      navigate("/tasks");
    } catch (error) {
      console.error("Error saving task:", error);
      setError("Failed to save task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteTask(taskId);
      navigate("/tasks");
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task");
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleCancel = () => {
    navigate("/tasks");
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "#007a00";
      case "in-progress":
        return "#daa520";
      default:
        return "#a00000";
    }
  };

  const isDeadlineInFuture = deadline && new Date(deadline) > new Date();

  if (isLoading && !isNewTask) {
    return (
      <div className="container mt-5">
        <div className="task-editor-container" style={{ position: 'relative' }}>
          <div className="editor-spine"></div>
          <div className="loading-state">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading task...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mt-5">
        <div
          className={`task-editor-container ${theme === "dark" ? "dark" : ""}`}
          style={{ position: 'relative' }}
        >
          <div className="editor-spine" style={{ backgroundColor: getStatusColor() }}></div>
          
          <div className="editor-header">
            <button
              className="back-button"
              onClick={handleCancel}
              disabled={isLoading}
              aria-label="Go back to tasks"
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            <h2>{isNewTask ? "Create New Task" : "Edit Task"}</h2>
            <i
              className={`bi ${
                status === "completed"
                  ? "bi-check-circle-fill"
                  : status === "in-progress"
                  ? "bi-hourglass-split"
                  : "bi-circle"
              } status-icon-header`}
              style={{ color: getStatusColor() }}
            />
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          <div className="editor-form">
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-pencil-square me-1"></i>
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-text-paragraph me-1"></i>
                Description <span className="required">*</span>
              </label>
              <textarea
                className="form-control"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description..."
                disabled={isLoading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-flag me-1"></i>
                  Status
                </label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isLoading}
                  style={{ color: getStatusColor() }}
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-calendar-event me-1"></i>
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={deadline ? formatDateTimeLocal(deadline) : ""}
                  onChange={(e) => setDeadline(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {isDeadlineInFuture && (
              <div className="form-group reminders-section">
                <label className="form-label">
                  <i className="bi bi-clock-history me-1"></i>
                  Reminders
                </label>
                <TaskReminders
                  tempDeadline={deadline}
                  tempReminders={reminders}
                  setTempReminders={setReminders}
                  theme={theme}
                  ALL_INTERVALS={REMINDER_INTERVALS}
                />
              </div>
            )}
          </div>

          <div className="editor-actions">
            {!isNewTask && (
              <button
                className="btn btn-danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={isLoading}
              >
                <i className="bi bi-trash me-2"></i>
                Delete Task
              </button>
            )}
            <div className="action-group">
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={!title.trim() || !description.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    {isNewTask ? "Create Task" : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        theme={theme}
        show={showDeleteModal}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
};

export default TaskEditor;