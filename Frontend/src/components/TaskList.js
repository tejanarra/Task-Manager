import React, { useState, useEffect } from "react";
import {
  fetchTasks,
  updateTaskPriority,
  createTask,
  updateTaskReminders,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import TaskItem from "./taskItem/TaskItem";
import AIChatModal from "./AIChatModal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "../Styles/TaskList.css";

// Convert backend enums to UI values
const normalizeStatusUI = (backendStatus) => {
  switch (backendStatus) {
    case "IN_PROGRESS":
      return "in-progress";
    case "COMPLETED":
      return "completed";
    default:
      return "not-started";
  }
};

// Convert backend reminders → UI reminder format
const convertBackendRemindersToUI = (task) => {
  if (!task.reminders?.length || !task.deadlineUTC) return task;

  const deadline = new Date(task.deadlineUTC);

  const converted = task.reminders.map((r) => {
    if (r.type === "ONE_TIME") {
      return {
        remindBefore: (deadline - new Date(r.triggerAtUTC)) / (1000 * 60 * 60),
        sent: false,
        customDate: r.triggerAtUTC,
      };
    }
    if (r.type === "DAILY") {
      return {
        type: "daily",
        hourOfDayUTC: r.hourOfDayUTC,
      };
    }
    if (r.type === "WEEKLY") {
      return {
        type: "weekly",
        hourOfDayUTC: r.hourOfDayUTC,
        dayOfWeek: r.dayOfWeek,
      };
    }
    return null;
  });

  return { ...task, reminders: converted.filter(Boolean) };
};

const TaskList = ({ theme }) => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState(null);
  const [newTaskId, setNewTaskId] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchTasks()
      .then((res) => {
        const mapped = res.data.map((t) => ({
          ...convertBackendRemindersToUI(t),
          status: normalizeStatusUI(t.status),
        }));
        setTasks(mapped);
      })
      .catch((err) => {
        console.error("Load tasks error:", err);
        if (err.response?.status === 403) logout();
      });
  }, [user, logout]);

  const handleDragEnd = async ({ destination, source }) => {
    if (!destination || destination.index === source.index) return;

    const reordered = Array.from(tasks);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);

    reordered.forEach((t, i) => (t.priority = i + 1));
    setTasks(reordered);

    try {
      await updateTaskPriority(moved.id, destination.index + 1);
    } catch (err) {
      console.error("Priority update failed:", err);
    }
  };

  const handleAddTask = () => {
    const newTask = {
      id: `temp-${Date.now()}`,
      title: "",
      description: "",
      status: "not-started",
      deadlineUTC: null,
      reminders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: tasks?.length + 1 || 1,
    };

    setNewTaskId(newTask.id);
    setTasks((prev) => [newTask, ...(prev || [])]);
  };

  const handleSaveNewTask = async (t) => {
    try {
      const res = await createTask(t);
      const saved = {
        ...convertBackendRemindersToUI(res.data),
        status: normalizeStatusUI(res.data.status),
      };

      if (t.reminders?.length) {
        await updateTaskReminders(saved.id, t.reminders);
        saved.reminders = t.reminders;
      }

      setTasks((prev) => prev.map((x) => (x.id === t.id ? saved : x)));
      setNewTaskId(null);
    } catch (err) {
      console.error("Create failed:", err);
    }
  };

  const handleCancelNewTask = (tempId) => {
    setTasks((p) => p.filter((t) => t.id !== tempId));
    setNewTaskId(null);
  };

  const handleAITaskGenerated = (task) => {
    setNewTaskId(task.id);
    setTasks((prev) => [task, ...prev]);
  };

  if (!tasks) return <p className="text-center mt-5">Loading...</p>;

  return (
    <>
      <div className="container mt-5">
        <div className="task-container card-body p-3">
          <div className="d-flex justify-content-between mb-3">
            <h2>Your Tasks</h2>
            <div className="d-flex gap-2">
              <button
                className={`btn btn-outline-${
                  theme === "dark" ? "light" : "dark"
                }`}
                onClick={() => setShowAIModal(true)}
              >
                <i className="bi bi-robot me-2" /> AI Assistant
              </button>

              <button
                className={`btn btn-outline-${
                  theme === "dark" ? "light" : "dark"
                }`}
                onClick={handleAddTask}
              >
                <i className="bi bi-plus-circle" /> New Task
              </button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <p>No tasks yet</p>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="taskList">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {tasks
                      .sort((a, b) => a.priority - b.priority)
                      .map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={String(task.id)}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="mb-3"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
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

      <AIChatModal
        show={showAIModal}
        onClose={() => setShowAIModal(false)}
        onTaskGenerated={handleAITaskGenerated}
        theme={theme}
      />
    </>
  );
};

export default TaskList;
