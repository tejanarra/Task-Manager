import React, { useState } from "react";
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

  if (!show) return null;

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div
        className={`ai-modal-content ${theme === "dark" ? "dark-mode" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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

        {/* Error Banner */}
        {error && (
          <div className="error-banner">
            <i className="bi bi-exclamation-triangle"></i> {error}
          </div>
        )}

        {/* Mode Content */}
        {mode === "quick" ? (
          <QuickMode
            setError={setError}
            setPreviewTask={setPreviewTask}
            onTaskGenerated={onTaskGenerated}
            onClose={onClose}
            theme={theme}
          />
        ) : (
          <ChatMode
            setError={setError}
            theme={theme}
            refreshTasks={refreshTasks}
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
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default AIChatModal;
