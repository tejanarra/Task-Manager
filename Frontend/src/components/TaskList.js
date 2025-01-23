import React, { useState, useEffect } from "react";
import { fetchTasks, updateTaskPriority, createTask } from "../services/api";
import { useAuth } from "../context/AuthContext";
import TaskItem from "./TaskItem";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "bootstrap/dist/css/bootstrap.min.css";

const TaskList = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: tasks.length + 1,
    };

    setNewTaskId(newTask.id);
    setTasks((prev) => [...prev, newTask]);
  };

  const handleSaveNewTask = async (task) => {
    try {
      const response = await createTask({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: tasks.length + 1,
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

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="card-title mb-4">Your Tasks</h2>
            <button
              className="btn btn-outline-primary d-flex align-items-center gap-1"
              style={{ borderRadius: "6px" }}
              onClick={handleAddTask}
            >
              <i className="bi bi-plus"></i> Add Task
            </button>
          </div>
          {tasks.length === 0 ? (
            <p>No tasks available</p>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="taskList">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
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
                              style={{
                                ...provided.draggableProps.style,
                                marginBottom: "10px",
                              }}
                            >
                              <TaskItem
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