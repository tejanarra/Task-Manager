import React, { useState, useEffect } from "react";
import { fetchTasks, updateTaskPriority } from "../services/api";
import { useAuth } from "../context/AuthContext";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
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
                              <TaskItem task={task} setTasks={setTasks} />
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
