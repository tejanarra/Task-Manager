"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchTasks, updateTaskPriority } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import TaskCard from "./taskItem/TaskCard";
import AIChatModal from "./AIChatModal/AIChatModal";
import FloatingChatWidget from "./AIChatModal/FloatingChatWidget";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TaskList.css";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableTask = ({ task, theme }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    transition: {
      duration: 250,
      easing: "cubic-bezier(0.25, 0.8, 0.25, 1)",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition || "transform 250ms cubic-bezier(0.25, 0.8, 0.25, 1)",
    opacity: isDragging ? 0 : 1,
    cursor: "grab",
    touchAction: "manipulation",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard theme={theme} task={task} />
    </div>
  );
};

const TaskList = ({ theme }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [chatMode, setChatMode] = useState(() => {
    const saved = localStorage.getItem("ai_chat_ui_mode");
    return saved || "drawer";
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // Listen for chat mode changes
  useEffect(() => {
    const handleChatModeChange = (e) => {
      setChatMode(e.detail);
      setShowAIModal(false); // Close drawer if switching to widget
    };
    const handleStorageChange = () => {
      const saved = localStorage.getItem("ai_chat_ui_mode");
      if (saved && saved !== chatMode) {
        setChatMode(saved);
        setShowAIModal(false);
      }
    };
    window.addEventListener("chatModeChanged", handleChatModeChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("chatModeChanged", handleChatModeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [chatMode]);

  const loadTasks = useCallback(async () => {
    if (user) {
      try {
        const response = await fetchTasks();
        setTasks(response.data.tasks || response.data);
      } catch (error) {
        console.error("Error loading tasks:", error);
        if (error.response && error.response.status === 403) logout();
      }
    }
  }, [user, logout]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const refreshTasks = async () => {
    try {
      const response = await fetchTasks();
      const tasksData = response.data.tasks || response.data;
      setTasks(tasksData);
      return tasksData;
    } catch (error) {
      console.error("Error refreshing tasks:", error);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    setTasks((prevTasks) => {
      const oldIndex = prevTasks.findIndex((t) => t.id === active.id);
      const newIndex = prevTasks.findIndex((t) => t.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return prevTasks;

      const reordered = arrayMove(prevTasks, oldIndex, newIndex);

      const updatePromises = reordered.map((task, idx) => {
        const newPriority = idx + 1;
        if (task.priority !== newPriority) {
          return updateTaskPriority(task.id, newPriority).catch((err) => {
            console.error(`Error updating priority for task ${task.id}:`, err);
          });
        }
        return Promise.resolve();
      });

      Promise.all(updatePromises);

      return reordered.map((task, idx) => ({
        ...task,
        priority: idx + 1,
      }));
    });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleAddTask = () => {
    router.push("/tasks/new/edit");
  };

  const handleAITaskGenerated = (aiGeneratedTask) => {
    router.push("/tasks/new/edit", { state: { task: aiGeneratedTask } });
  };

  const renderShimmerLoader = () => (
    <div className="container mt-5">
      <div className="task-container">
        <div className="card-body p-3">
          <div className="d-flex flex-row justify-content-between align-items-center mb-3 header-container">
            <h2 className="card-title mb-0">Your Tasks</h2>
            <div className="d-flex gap-2 button-group">
              <button
                className={`btn btn-outline-${
                  theme === "dark" ? "light" : "dark"
                } d-flex align-items-center gap-2`}
                onClick={handleAddTask}
                aria-label="Create new task"
              >
                <i className="bi bi-plus-circle" aria-hidden="true"></i>
                <span className="button-text">New Task</span>
              </button>
            </div>
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

  if (!tasks) return renderShimmerLoader();

  const sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority);
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  return (
    <>
      <div className="container mt-5">
        <div className="task-container">
          <div className="card-body p-3">
            <div className="d-flex flex-row justify-content-between align-items-center mb-3 header-container">
              <h2 className="card-title mb-0">Your Tasks</h2>
              <div className="d-flex gap-2 button-group">
                <button
                  className={`btn btn-outline-${
                    theme === "dark" ? "light" : "dark"
                  } d-flex align-items-center gap-2`}
                  onClick={handleAddTask}
                >
                  <i className="bi bi-plus-circle"></i>
                  <span className="button-text">New Task</span>
                </button>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-clipboard-check empty-state-icon"></i>
                <p
                  className={`text-${
                    theme === "dark" ? "light" : "muted"
                  } mb-2`}
                >
                  No tasks yet
                </p>
                <small className="text-muted">
                  Create your first task or use AI Assistant to get started
                </small>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <SortableContext
                  items={sortedTasks.map((t) => t.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="task-list">
                    {sortedTasks.map((task) => (
                      <SortableTask key={task.id} task={task} theme={theme} />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay
                  adjustScale={false}
                  dropAnimation={{
                    duration: 300,
                    easing: "cubic-bezier(0.25, 0.8, 0.25, 1)",
                  }}
                  style={{
                    cursor: "grabbing",
                  }}
                >
                  {activeTask ? (
                    <div
                      style={{
                        transform: "scale(1.03) rotate(2deg)",
                        cursor: "grabbing",
                        boxShadow:
                          "0 12px 24px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15)",
                        borderRadius: "10px",
                        transition:
                          "all 150ms cubic-bezier(0.25, 0.8, 0.25, 1)",
                      }}
                    >
                      <TaskCard theme={theme} task={activeTask} />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      {/* Drawer Mode */}
      {chatMode === "drawer" && (
        <AIChatModal
          show={showAIModal}
          onClose={() => setShowAIModal(false)}
          onTaskGenerated={handleAITaskGenerated}
          theme={theme}
          refreshTasks={refreshTasks}
        />
      )}

      {/* Widget/Drawer with Cloud Button */}
      <FloatingChatWidget
        theme={theme}
        onTaskGenerated={handleAITaskGenerated}
        refreshTasks={refreshTasks}
      />
    </>
  );
};

export default TaskList;
