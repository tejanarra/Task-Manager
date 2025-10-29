import React, { useState, useEffect } from "react";
import QuickMode from "./QuickMode";
import ChatMode from "./ChatMode";
import TaskPreviewModal from "./TaskPreviewModal";
import "./Styles/AIChatModal.css";

const AIChatModal = ({
  show,
  onClose,
  onTaskGenerated,
  theme,
  refreshTasks,
}) => {
  const [mode, setMode] = useState("quick");
  const [previewTask, setPreviewTask] = useState(null);
  const [error, setError] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Load last used mode from localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("ai_chat_mode");
      if (savedMode && (savedMode === "quick" || savedMode === "chat")) {
        setMode(savedMode);
      }
    } catch (error) {
      console.error("Error loading chat mode:", error);
    }
  }, []);

  // Save mode preference when it changes
  useEffect(() => {
    try {
      localStorage.setItem("ai_chat_mode", mode);
    } catch (error) {
      console.error("Error saving chat mode:", error);
    }
  }, [mode]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && show && !previewTask) {
        handleClose();
      }
    };

    if (show) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [show, previewTask]);

  const handleClose = () => {
    setIsClosing(true);
    // Small delay for animation
    setTimeout(() => {
      setIsClosing(false);
      setError(null);
      onClose();
    }, 250);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !previewTask) {
      handleClose();
    }
  };

  if (!show && !isClosing) return null;

  return (
    <div
      className={`ai-modal-overlay ${isClosing ? "closing" : ""}`}
      onClick={handleOverlayClick}
    >
      <div
        className={`ai-modal-content ${theme === "dark" ? "dark-mode" : ""} ${
          isClosing ? "closing" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="ai-modal-header">
          <h3>
            <i className="bi bi-robot"></i> AI Task Assistant
          </h3>
          <button
            className="close-button"
            onClick={handleClose}
            aria-label="Close AI Assistant"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="ai-mode-selector">
          <button
            className={`mode-button ${mode === "quick" ? "active" : ""}`}
            onClick={() => setMode("quick")}
            aria-pressed={mode === "quick"}
          >
            <i className="bi bi-lightning-charge"></i> Quick
          </button>
          <button
            className={`mode-button ${mode === "chat" ? "active" : ""}`}
            onClick={() => setMode("chat")}
            aria-pressed={mode === "chat"}
          >
            <i className="bi bi-chat-dots"></i> Chat
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <i className="bi bi-exclamation-triangle"></i> {error}
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                padding: "0 4px",
              }}
              aria-label="Dismiss error"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {/* Mode Content */}
        {mode === "quick" ? (
          <QuickMode
            setError={setError}
            setPreviewTask={setPreviewTask}
            onTaskGenerated={onTaskGenerated}
            onClose={handleClose}
            theme={theme}
          />
        ) : (
          <ChatMode
            setError={setError}
            theme={theme}
            refreshTasks={refreshTasks}
            onClose={handleClose}
          />
        )}
      </div>

      {/* Preview Modal */}
      {previewTask && (
        <TaskPreviewModal
          theme={theme}
          task={previewTask}
          onClose={() => setPreviewTask(null)}
          onSave={(task) => {
            onTaskGenerated(task);
            setPreviewTask(null);
            handleClose();
          }}
        />
      )}
    </div>
  );
};

export default AIChatModal;
