import React, { useState, useEffect } from "react";
import { fetchTasks, updateTaskPriority, createTask } from "../services/api";
import { useAuth } from "../context/AuthContext";
import TaskItem from "./taskItem/TaskItem";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/TaskList.css";

const TaskList = ({ theme }) => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState(null);
  const [newTaskId, setNewTaskId] = useState(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (user) {
        try {
          const response = await fetchTasks();
          setTasks(response.data);
        } catch (error) {
          console.error("Error loading tasks:", error);
          if (error.response && error.response.status === 403) {
            logout();
          }
        }
      }
    };

    loadTasks();
  }, [user, logout]);

  const handleDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index) return;

    const reorderedTasks = Array.from(tasks);
    const [movedTask] = reorderedTasks.splice(source.index, 1);
    reorderedTasks.splice(destination.index, 0, movedTask);

    const updatedTasksWithPriority = reorderedTasks.map((task, index) => ({
      ...task,
      priority: index + 1,
    }));

    setTasks(updatedTasksWithPriority);

    try {
      const movedTaskId = movedTask.id;
      const newPriority = destination.index + 1;
      await updateTaskPriority(movedTaskId, newPriority);
    } catch (error) {
      console.error("Error updating task priority:", error);
      if (error.response && error.response.status === 403) {
        logout();
      }
    }
  };

  const handleAddTask = () => {
    const newTask = {
      id: `temp-${Date.now()}`,
      title: "",
      description: "",
      status: "not-started",
      deadline: null,
      reminders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: 1,
    };

    setNewTaskId(newTask.id);
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleSaveNewTask = async (task) => {
    try {
      const response = await createTask({
        title: task.title,
        description: task.description,
        status: task.status,
        deadline: task.deadline,
        priority: tasks.length + 1,
        reminders: task.reminders,
      });

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? response.data : t))
      );
      setNewTaskId(null);
    } catch (error) {
      console.error("Error saving new task:", error);
      if (error.response && error.response.status === 403) {
        logout();
      }
    }
  };

  const handleCancelNewTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setNewTaskId(null);
  };

  const renderShimmerLoader = () => (
    <div className="container mt-5">
      <div className="task-container">
        <div className="card-body p-3">
          <div className="d-flex justify-content-between align-items-center mb-3 header-container">
            <h2 className="card-title mb-0">Your Tasks</h2>
          </div>
          <div className="shimmer-list">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="shimmer-task-item">
                <div className="shimmer-task-header"></div>
                <div className="shimmer-task-body"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!tasks) {
    return renderShimmerLoader();
  }

  return (
    <div className="container mt-5">
      <div className="task-container">
        <div className="card-body p-3">
          <div className="d-flex flex-row justify-content-between align-items-center mb-3 header-container">
            <h2 className="card-title mb-0">Your Tasks</h2>
            {theme === "dark" ? (
              <button
                className="btn btn-outline-light d-flex align-items-center gap-2 add-task-button"
                onClick={handleAddTask}
                aria-label="Add a new task"
              >
                New Task
              </button>
            ) : (
              <button
                className="btn btn-outline-dark d-flex align-items-center gap-2 add-task-button"
                onClick={handleAddTask}
                aria-label="Add a new task"
              >
                New Task
              </button>
            )}
          </div>
          {tasks.length === 0 ? (
            <p className={`text-${theme === "dark" ? "light" : "muted"} mb-4`}>
              No tasks available
            </p>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="taskList">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="task-list"
                  >
                    {tasks
                      .sort((a, b) => a.priority - b.priority)
                      .map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-3"
                              style={{
                                ...provided.draggableProps.style,
                              }}
                            >
                              <TaskItem
                                theme={theme}
                                task={task}
                                setTasks={setTasks}
                                isNewTask={task.id === newTaskId}
                                onSave={handleSaveNewTask}
                                onCancel={handleCancelNewTask}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
