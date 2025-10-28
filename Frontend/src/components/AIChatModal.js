import React, { useState, useRef, useEffect } from "react";
import { generateAITask, sendAIChatMessage } from "../services/api";
import TaskItem from "./taskItem/TaskItem";
import "../Styles/AIChatModal.css";
import { useAuth } from "../context/AuthContext";

const AIChatModal = ({ show, onClose, onTaskGenerated, theme, setTasks }) => {
  const [mode, setMode] = useState("quick"); // 'quick' or 'chat'
  const [quickPrompt, setQuickPrompt] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewTask, setPreviewTask] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // 🧠 User info from localStorage
  const { user } = useAuth();
  const userAvatar = user.avatar;
  const userFirstName = user.firstName;
  const userLastName = user.lastName;

  const userInitials =
    (userFirstName?.[0]?.toUpperCase() || "") +
    (userLastName?.[0]?.toUpperCase() || "");
  const displayInitials = userInitials || "?";

  useEffect(() => {
    if (show && inputRef.current) inputRef.current.focus();
  }, [show, mode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleQuickGenerate = async () => {
    if (!quickPrompt.trim()) return;
    setIsLoading(true);
    setError(null);

    const result = await generateAITask(quickPrompt);
    setIsLoading(false);

    if (!result.success) return setError(result.error);

    const aiTask = result.data;
    const newTask = {
      id: `temp-${Date.now()}`,
      title: aiTask.title,
      description: aiTask.description,
      status: aiTask.status || "not-started",
      deadline: aiTask.deadline,
      reminders: aiTask.reminders || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: 1,
    };

    setPreviewTask(newTask);
  };

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
    if (!result.success) return setError(result.error);

    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: result.data.reply,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

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

    const contextualPrompt = `Based on this conversation, create a task:\n\n${conversationSummary}\n\nCreate a detailed task with appropriate deadline and reminders based on the user's requirements discussed above.`;

    const result = await generateAITask(contextualPrompt);
    setIsLoading(false);

    if (!result.success) return setError(result.error);

    const aiTask = result.data;
    const newTask = {
      id: `temp-${Date.now()}`,
      title: aiTask.title,
      description: aiTask.description,
      status: aiTask.status || "not-started",
      deadline: aiTask.deadline,
      reminders: aiTask.reminders || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: 1,
    };

    setPreviewTask(newTask);
  };

  const handleKeyPress = (e, handler) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handler();
    }
  };

  const resetChat = () => {
    setChatMessages([]);
    setError(null);
  };

  if (!show) return null;

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div
        className={`ai-modal-content ${theme === "dark" ? "dark-mode" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ai-modal-header">
          <h3>
            <i className="bi bi-robot"></i> AI Task Assistant
          </h3>
          <button className="close-button" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="ai-mode-selector">
          <button
            className={`mode-button ${mode === "quick" ? "active" : ""}`}
            onClick={() => setMode("quick")}
          >
            <i className="bi bi-lightning-charge"></i> Quick Generate
          </button>
          <button
            className={`mode-button ${mode === "chat" ? "active" : ""}`}
            onClick={() => setMode("chat")}
          >
            <i className="bi bi-chat-dots"></i> Chat Mode
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        )}

        {/* Quick Mode */}
        {mode === "quick" ? (
          <div className="quick-mode">
            <div className="quick-mode-content">
              <label className="form-label">Describe your task:</label>
              <textarea
                ref={inputRef}
                className="form-control"
                rows={4}
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, handleQuickGenerate)}
                placeholder="E.g., 'Prepare project report by Friday 5PM'"
                disabled={isLoading}
              />
              <div className="quick-mode-suggestions">
                <small>Try these:</small>
                {[
                  "Schedule dentist appointment",
                  "Plan weekend shopping",
                  "Prepare presentation",
                ].map((text) => (
                  <button
                    key={text}
                    className="suggestion-chip"
                    onClick={() => setQuickPrompt(text)}
                    disabled={isLoading}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleQuickGenerate}
                disabled={!quickPrompt.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>{" "}
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-magic me-2"></i> Generate Task
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Chat Mode
          <div className="chat-mode">
            <div className="chat-messages">
              {chatMessages.length === 0 ? (
                <div className="chat-empty-state">
                  <i className="bi bi-chat-heart"></i>
                  <p>Start a conversation with AI</p>
                  <small>
                    Ask questions or describe your task step by step
                  </small>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat-message ${
                      msg.role === "user" ? "user" : "assistant"
                    }`}
                  >
                    <div className="message-avatar">
                      {msg.role === "user" ? (
                        userAvatar ? (
                          <img
                            src={userAvatar}
                            alt="User"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border:
                                theme === "dark"
                                  ? "1px solid #fff"
                                  : "1px solid #000",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: "#6c757d",
                              color: "#fff",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.9rem",
                              border:
                                theme === "dark"
                                  ? "1px solid #fff"
                                  : "1px solid #000",
                            }}
                          >
                            {displayInitials}
                          </div>
                        )
                      ) : (
                        <i className="bi bi-robot"></i>
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-text">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
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
                onKeyDown={(e) => handleKeyPress(e, handleChatSend)}
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

            <div className="chat-actions">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={resetChat}
                disabled={isLoading || chatMessages.length === 0}
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Reset
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleGenerateFromChat}
                disabled={isLoading || chatMessages.length === 0}
              >
                <i className="bi bi-check2-circle me-1"></i> Create Task
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Preview Modal using TaskItem */}
      {previewTask && (
        <div
          className="ai-preview-overlay"
          onClick={() => setPreviewTask(null)}
        >
          <div
            className="ai-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="mb-3">
              <i className="bi bi-eye"></i> Task Preview
            </h5>

            <TaskItem
              theme={theme}
              task={previewTask}
              isNewTask={true}
              onSave={(task) => {
                onTaskGenerated(task);
                setPreviewTask(null);
                onClose();
              }}
              onCancel={() => setPreviewTask(null)}
            />

            <div className="text-end mt-2">
              <button
                className="btn btn-secondary"
                onClick={() => setPreviewTask(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatModal;
