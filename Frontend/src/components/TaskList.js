import React, { useState, useEffect } from "react";
import { fetchTasks } from "../services/api";
import { useAuth } from "../context/AuthContext";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";
import "bootstrap/dist/css/bootstrap.min.css";

const TaskList = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      if (user) {
        try {
          const response = await fetchTasks();
          if (response.status === 200) {
            setTasks(response.data);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Error loading tasks:", error);
        }
      }
    };

    loadTasks();
  }, [user, logout]);

  return (
    <div className="container mt-5">
      {isFormOpen && (
        <TaskForm setTasks={setTasks} closeForm={() => setIsFormOpen(false)} />
      )}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="card-title mb-4">Your Tasks</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsFormOpen(true)}
            >
              <i className="bi bi-plus"></i> Add Task
            </button>
          </div>
          {tasks.length === 0 ? (
            <p>No tasks available</p>
          ) : (
            <div>
              {tasks
                .sort((a, b) => {
                  // Prioritize tasks that are not completed
                  if (a.status === "completed" && b.status !== "completed")
                    return 1; // a goes below b
                  if (b.status === "completed" && a.status !== "completed")
                    return -1; // b goes below a

                  // If statuses are the same, sort by created date in ascending order (oldest first)
                  return new Date(a.createdAt) - new Date(b.createdAt);
                })
                .map((task) => (
                  <TaskItem key={task.id} task={task} setTasks={setTasks} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
