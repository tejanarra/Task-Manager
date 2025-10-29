import React, { useState, useRef, useEffect } from "react";
import { normalizeRemindersBeforeSave } from "../../utils/reminderHelpers";

import {
  sendAIChatMessage,
  generateAITask,
  updateTask,
  deleteTask,
  createTask,
} from "../../services/api";
import ChatMessage from "./ChatMessage";
import TaskItem from "../taskItem/TaskItem";
import { useAuth } from "../../context/AuthContext";

const CHAT_HISTORY_KEY = "ai_chat_history";

const ChatMode = ({ setError, theme, refreshTasks }) => {
  const { user } = useAuth();
  
  // Load chat history from localStorage on mount
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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, previewTask]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatMessages));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  }, [chatMessages]);

  /* ====================================================
     Send Message to AI (chatConversation)
  ==================================================== */
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);
    setError(null);

    const conversationHistory = chatMessages.map((msg) => ({
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

    // Add assistant's reply
    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      },
    ]);

    // If AI suggests update/delete – show inline TaskItem
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

  /* ====================================================
     Generate new task from chat
  ==================================================== */
  const handleGenerateFromChat = async () => {
    if (chatMessages.length === 0) {
      setError("No conversation found to generate task from");
      return;
    }

    setIsLoading(true);
    setError(null);

    const conversationSummary = chatMessages
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

  /* ====================================================
     Confirm or Cancel AI Update / Delete
  ==================================================== */
  const handleConfirmUpdate = async (task) => {
    try {
      if (!task) return;
      setIsLoading(true);
      setError(null);

      // Normalize reminders before saving
      const normalizedReminders = normalizeRemindersBeforeSave(
        task.reminders || [],
        task.deadline
      );

      let resultMessage = "";

      if (task.action === "delete") {
        await deleteTask(task.id);
        resultMessage = `🗑️ Deleted task "${task.title}".`;
      } else if (task.action === "create") {
        await createTask({
          title: task.title,
          description: task.description,
          status: task.status,
          deadline: task.deadline,
          reminders: normalizedReminders,
        });
        resultMessage = `✨ Created new task "${task.title}".`;
      } else {
        await updateTask(task.id, {
          title: task.title,
          description: task.description,
          status: task.status,
          deadline: task.deadline,
          reminders: normalizedReminders,
        });
        resultMessage = `✅ Updated task "${task.title}".`;
      }

      await refreshTasks();
      setPreviewTask(null);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: resultMessage,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error applying AI update:", error);
      setError("Failed to apply update.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelPreview = () => setPreviewTask(null);

  /* ====================================================
     Helpers
  ==================================================== */
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

  /* ====================================================
     RENDER
  ==================================================== */
  return (
    <div className="chat-mode">
      <div className="chat-messages">
        {/* Empty Chat State */}
        {chatMessages.length === 0 && !previewTask ? (
          <div className="chat-empty-state">
            <i className="bi bi-chat-heart"></i>
            <p>Start a conversation with AI</p>
            <small>Ask questions or describe your task step by step</small>
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <ChatMessage key={index} msg={msg} user={user} theme={theme} />
          ))
        )}

        {/* Inline Task Preview using TaskItem */}
        {previewTask && (
          <div className="chat-message assistant">
            <div className="message-avatar">
              <i className="bi bi-robot"></i>
            </div>
            <div className="message-content w-100">
              {previewTask.action === "delete" ? (
                <div
                  className={`ai-delete-preview p-3 rounded ${
                    theme === "dark"
                      ? "bg-dark text-light"
                      : "bg-light text-dark"
                  }`}
                >
                  <h6 className="mb-2">
                    🗑️ Confirm delete: <strong>{previewTask.title}</strong>?
                  </h6>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleConfirmUpdate(previewTask)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleCancelPreview}
                      disabled={isLoading}
                    >
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
                  onSave={handleConfirmUpdate}
                  onCancel={handleCancelPreview}
                />
              )}
            </div>
          </div>
        )}

        {/* Typing indicator */}
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

      {/* Chat Input */}
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
        />
        <button
          className="send-button"
          onClick={handleChatSend}
          disabled={!chatInput.trim() || isLoading}
        >
          <i className="bi bi-send-fill"></i>
        </button>
      </div>

      {/* Chat Footer Actions */}
      <div className="chat-actions">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={resetChat}
          disabled={isLoading || chatMessages.length === 0}
        >
          <i className="bi bi-arrow-clockwise me-1"></i> Clear Chat
        </button>
        <button
          className="btn btn-sm btn-primary"
          onClick={handleGenerateFromChat}
          disabled={isLoading || chatMessages.length === 0}
        >
          <i className="bi bi-magic me-1"></i> Generate Task
        </button>
      </div>
    </div>
  );
};

export default ChatMode;