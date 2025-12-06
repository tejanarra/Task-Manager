"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  isWidget = false,
  showOptions = false,
  setShowOptions = null,
  chatMode = null,
  onModeChange = null,
  widgetSize = "medium",
  onSizeChange = null,
  optionsRef = null,
}) => {
  const [mode, setMode] = useState("quick");
  const [previewTask, setPreviewTask] = useState(null);
  // ✅ FIXED: Removed unused previewHistory state
  const [error, setError] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const scrollPositionRef = useRef(0);

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

  useEffect(() => {
    try {
      localStorage.setItem("ai_chat_mode", mode);
    } catch (error) {
      console.error("Error saving chat mode:", error);
    }
  }, [mode]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setError(null);
      setPreviewTask(null);
      onClose();
    }, 250);
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && show && !previewTask && !isWidget) {
        handleClose();
      }
    };

    if (show && !isWidget) {
      scrollPositionRef.current = window.pageYOffset;
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollPositionRef.current}px`;
    }

    return () => {
      if (!isWidget) {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
        window.scrollTo(0, scrollPositionRef.current);
      }
    };
  }, [show, previewTask, handleClose, isWidget]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !previewTask && !isWidget) {
      handleClose();
    }
  };

  if (!show && !isClosing) return null;

  if (isWidget) {
    return (
      <>
        <div className="ai-mode-selector">
          <button
            className={`mode-button ${mode === "quick" ? "active" : ""}`}
            onClick={() => setMode("quick")}
            aria-pressed={mode === "quick"}
            aria-label="Switch to Quick Mode - Generate tasks quickly with a simple prompt"
          >
            <i className="bi bi-lightning-charge" aria-hidden="true"></i> Quick
          </button>

          <button
            className={`mode-button ${mode === "chat" ? "active" : ""}`}
            onClick={() => setMode("chat")}
            aria-pressed={mode === "chat"}
            aria-label="Switch to Chat Mode - Have a conversation to refine your task"
          >
            <i className="bi bi-chat-dots" aria-hidden="true"></i> Chat
          </button>
        </div>

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
            key={mode}
          />
        )}

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
      </>
    );
  }

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
        <div className="ai-modal-header">
          <h3>
            <i className="bi bi-robot"></i> AI Task Assistant
          </h3>
          <div className="header-options-wrapper">
            {setShowOptions && (
              <div className="floating-options" ref={optionsRef}>
                <button
                  className="close-button"
                  onClick={() => setShowOptions(!showOptions)}
                  aria-label="Options"
                  style={{ marginRight: "8px" }}
                >
                  <i className="bi bi-three-dots-vertical"></i>
                </button>

                {showOptions && (
                  <div
                    className={`options-dropdown ${
                      theme === "dark" ? "dark" : ""
                    }`}
                  >
                    <div className="options-header">Chat Mode</div>
                    <button
                      className={`option-item ${
                        chatMode === "widget" ? "active" : ""
                      }`}
                      onClick={() => onModeChange("widget")}
                    >
                      <i className="bi bi-window"></i>
                      <span>Floating Widget</span>
                      {chatMode === "widget" && (
                        <i className="bi bi-check2"></i>
                      )}
                    </button>
                    <button
                      className={`option-item ${
                        chatMode === "drawer" ? "active" : ""
                      }`}
                      onClick={() => onModeChange("drawer")}
                    >
                      <i className="bi bi-layout-sidebar"></i>
                      <span>Sidebar Drawer</span>
                      {chatMode === "drawer" && (
                        <i className="bi bi-check2"></i>
                      )}
                    </button>

                    {onSizeChange && window.innerWidth > 768 && (
                      <>
                        <div className="options-divider"></div>
                        <div className="options-header">Window Size</div>
                        <button
                          className={`option-item ${
                            widgetSize === "small" ? "active" : ""
                          }`}
                          onClick={() => onSizeChange("small")}
                        >
                          <i className="bi bi-phone"></i>
                          <span>Small</span>
                          {widgetSize === "small" && (
                            <i className="bi bi-check2"></i>
                          )}
                        </button>
                        <button
                          className={`option-item ${
                            widgetSize === "medium" ? "active" : ""
                          }`}
                          onClick={() => onSizeChange("medium")}
                        >
                          <i className="bi bi-tablet"></i>
                          <span>Medium</span>
                          {widgetSize === "medium" && (
                            <i className="bi bi-check2"></i>
                          )}
                        </button>
                        <button
                          className={`option-item ${
                            widgetSize === "large" ? "active" : ""
                          }`}
                          onClick={() => onSizeChange("large")}
                        >
                          <i className="bi bi-laptop"></i>
                          <span>Large</span>
                          {widgetSize === "large" && (
                            <i className="bi bi-check2"></i>
                          )}
                        </button>
                        <button
                          className={`option-item ${
                            widgetSize === "fullscreen" ? "active" : ""
                          }`}
                          onClick={() => onSizeChange("fullscreen")}
                        >
                          <i className="bi bi-arrows-fullscreen"></i>
                          <span>Fullscreen</span>
                          {widgetSize === "fullscreen" && (
                            <i className="bi bi-check2"></i>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            <button
              className="close-button"
              onClick={handleClose}
              aria-label="Close AI Assistant"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

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
            key={mode}
          />
        )}
      </div>

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
