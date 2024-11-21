import React, { useState } from "react";
import { createTask } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../context/AuthContext";

const TaskForm = ({ setTasks, closeForm }) => {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("not-started");
  const [description, setDescription] = useState("");
  const { logout } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTask = {
      title,
      status,
      description,
    };

    try {
      const response = await createTask(newTask);
      setTasks((prevTasks) => [response.data, ...prevTasks]);
      closeForm();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create New Task</h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeForm}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Task Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Save Task
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
