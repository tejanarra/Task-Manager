"use client";

import { useState, useRef, useEffect } from "react";
import { normalizeRemindersBeforeSave } from "../../../utils/reminderUtils";

import {
  sendAIChatMessage,
  generateAITask,
  updateTask,
  deleteTask,
  createTask,
} from "../../../services/api";
import ChatMessage from "./ChatMessage";
import TaskItem from "../taskItem/TaskItem";
import { useAuth } from "../../../context/AuthContext";
import { STORAGE_KEYS } from "../../../constants/appConstants";
import "./Styles/ChatPreview.css";

const CHAT_HISTORY_KEY = STORAGE_KEYS.AI_CHAT_HISTORY;

// Compact Task Preview Badge Component
const TaskPreviewBadge = ({ task, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusText = () => {
    if (task.confirmed) {
      if (task.action === "delete") return "Deleted";
      if (task.action === "create") return "Created";
      return "Updated";
    }
    if (task.cancelled) return "Cancelled";
    if (task.action === "delete") return "Delete Request";
    if (task.action === "create") return "New Task";
    return "Update Request";
  };

  return (
    <div 
      className="task-preview-badge"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="badge-compact">
        <div className="badge-info">
          <div className="badge-status">{getStatusText()}</div>
          <div className="badge-title">{task.title}</div>
        </div>
        <div className="badge-expand-hint">
          <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'}`}></i>
        </div>
      </div>

      {isExpanded && (
        <div className="badge-expanded-content">
          <TaskItem
            theme={theme}
            task={{
              ...task,
              title: task.title || "",
              description: task.description || "",
              reminders: Array.isArray(task.reminders) ? task.reminders : [],
            }}
            isNewTask={false}
            isChatPreview={true}
            isHistoryPreview={true}
            onSave={() => {}}
            onCancel={() => {}}
          />
        </div>
      )}
    </div>
  );
};

// Delete Action Badge
const DeleteActionBadge = ({ task, theme }) => {
  const getStatusText = () => {
    if (task.confirmed) return "Deleted";
    if (task.cancelled) return "Delete Cancelled";
    return "Delete Request";
  };

  return (
    <div className="delete-action-badge">
      <div className="delete-info">
        <div className="delete-status">{getStatusText()}</div>
        <div className="delete-title">{task.title}</div>
      </div>
    </div>
  );
};

const ChatMode = ({ setError, theme, refreshTasks }) => {
  const { user } = useAuth();

  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading chat history:", error);
      return [];
    }
  });

  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewTask, setPreviewTask] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, previewTask]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatMessages));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  }, [chatMessages]);

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    if (previewTask) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          preview: previewTask,
        },
      ]);
      setPreviewTask(null);
    }

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

    const conversationHistory = chatMessages
      .filter((msg) => msg.content)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    const result = await sendAIChatMessage(
      userMessage.content,
      conversationHistory
    );

    setIsLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }

    const { reply, previewUpdate } = result.data;

    if (previewUpdate && previewUpdate.reminders) {
      previewUpdate.reminders = normalizeRemindersBeforeSave(
        previewUpdate.reminders,
        previewUpdate.deadline
      );
    }

    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (previewUpdate) {
      setPreviewTask({
        ...previewUpdate,
        _aiSuggested: true,
        isUpdate:
          previewUpdate.action === "update" ||
          previewUpdate.action === "delete",
        isNewTask: previewUpdate.action === "create" || previewUpdate.isNewTask,
        createdAt: previewUpdate.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleGenerateFromChat = async () => {
    if (chatMessages.filter((msg) => msg.content).length === 0) {
      setError("No conversation found to generate task from");
      return;
    }

    setIsLoading(true);
    setError(null);

    if (previewTask) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          preview: previewTask,
        },
      ]);
      setPreviewTask(null);
    }

    const conversationSummary = chatMessages
      .filter((msg) => msg.content)
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    const contextualPrompt = `Based on this conversation, create a task:\n\n${conversationSummary}\n\nCreate a detailed task with appropriate deadline and reminders.`;

    const result = await generateAITask(contextualPrompt);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const aiTask = result.data;
    setPreviewTask({
      ...aiTask,
      id: `temp-${Date.now()}`,
      status: aiTask.status || "not-started",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: 1,
      _aiSuggested: true,
      isNewTask: true,
      action: "create",
    });
  };

  const handleConfirmUpdate = async (task) => {
    try {
      if (!task) return;
      setIsLoading(true);
      setError(null);

      const normalizedReminders = normalizeRemindersBeforeSave(
        task.reminders || [],
        task.deadline
      );

      let resultMessage = "";

      if (task.action === "delete") {
        await deleteTask(task.id);
        resultMessage = `Successfully deleted "${task.title}"`;
      } else if (task.action === "create") {
        await createTask({
          title: task.title,
          description: task.description,
          status: task.status,
          deadline: task.deadline,
          reminders: normalizedReminders,
        });
        resultMessage = `Successfully created "${task.title}"`;
      } else {
        await updateTask(task.id, {
          title: task.title,
          description: task.description,
          status: task.status,
          deadline: task.deadline,
          reminders: normalizedReminders,
        });
        resultMessage = `Successfully updated "${task.title}"`;
      }

      await refreshTasks();

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          preview: { ...task, confirmed: true },
        },
        {
          role: "assistant",
          content: resultMessage,
          timestamp: new Date().toISOString(),
        },
      ]);

      setPreviewTask(null);
    } catch (error) {
      console.error("Error applying AI update:", error);
      setError("Failed to apply update.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPreview = () => {
    if (previewTask) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
          preview: { ...previewTask, cancelled: true },
        },
      ]);
      setPreviewTask(null);
    }
  };

  const resetChat = () => {
    setChatMessages([]);
    setError(null);
    setPreviewTask(null);
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  return (
    <div className="chat-mode">
      <div className="chat-messages">
        {chatMessages.length === 0 && !previewTask ? (
          <div className="chat-empty-state">
            <i className="bi bi-chat-heart"></i>
            <p>Start a conversation with AI</p>
            <small>Ask questions or describe your task step by step</small>
          </div>
        ) : (
          <>
            {chatMessages.map((msg, index) => {
              // If message has preview, render it as badge
              if (msg.preview) {
                const task = msg.preview;
                return (
                  <div key={index} className="chat-message assistant">
                    <div className="message-avatar">
                      <i className="bi bi-robot"></i>
                    </div>
                    <div className="message-content">
                      {task.action === "delete" ? (
                        <DeleteActionBadge task={task} theme={theme} />
                      ) : (
                        <TaskPreviewBadge task={task} theme={theme} />
                      )}
                    </div>
                  </div>
                );
              }

              // Regular text message
              if (msg.content) {
                return (
                  <ChatMessage
                    key={index}
                    msg={msg}
                    user={user}
                    theme={theme}
                  />
                );
              }

              return null;
            })}

            {/* Active preview task (with action buttons) */}
            {previewTask && (
              <div className="chat-message assistant">
                <div className="message-avatar">
                  <i className="bi bi-robot"></i>
                </div>
                <div className="message-content w-100">
                  {previewTask.action === "delete" ? (
                    <div className="active-delete-preview">
                      <div className="delete-preview-header">
                        <span className="delete-text">
                          Confirm deletion of{" "}
                          <strong>"{previewTask.title}"</strong>?
                        </span>
                      </div>
                      <div className="delete-preview-actions">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleConfirmUpdate(previewTask)}
                          disabled={isLoading}
                          aria-label="Confirm delete task"
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-trash me-1"></i>
                              Delete
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleCancelPreview}
                          disabled={isLoading}
                          aria-label="Cancel delete"
                        >
                          <i className="bi bi-x-lg me-1"></i>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <TaskItem
                      theme={theme}
                      task={{
                        ...previewTask,
                        title: previewTask.title || "",
                        description: previewTask.description || "",
                        reminders: Array.isArray(previewTask.reminders)
                          ? previewTask.reminders
                          : [],
                      }}
                      isNewTask={true}
                      isChatPreview={true}
                      onSave={handleConfirmUpdate}
                      onCancel={handleCancelPreview}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {isLoading && (
          <div className="chat-message assistant">
            <div className="message-avatar">
              <i className="bi bi-robot"></i>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          aria-label="Type your message to AI assistant"
        />
        <button
          className="send-button"
          onClick={handleChatSend}
          disabled={!chatInput.trim() || isLoading}
          aria-label="Send message"
        >
          <i className="bi bi-send-fill"></i>
        </button>
      </div>

      <div className="chat-actions">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={resetChat}
          disabled={isLoading || chatMessages.length === 0}
          aria-label="Clear chat history"
        >
          <i className="bi bi-arrow-clockwise me-1"></i> Clear Chat
        </button>
        <button
          className="btn btn-sm btn-primary"
          onClick={handleGenerateFromChat}
          disabled={
            isLoading || chatMessages.filter((msg) => msg.content).length === 0
          }
          aria-label="Generate task from conversation"
        >
          <i className="bi bi-magic me-1"></i> Generate Task
        </button>
      </div>
    </div>
  );
};

export default ChatMode;