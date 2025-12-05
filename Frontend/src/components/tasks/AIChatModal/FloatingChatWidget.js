import { useState, useEffect, useRef, useCallback } from "react";
import AIChatModal from "./AIChatModal";
import "./Styles/FloatingChatWidget.css";

const FloatingChatWidget = ({ theme, onTaskGenerated, refreshTasks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [chatMode, setChatMode] = useState(() => {
    const saved = localStorage.getItem("ai_chat_ui_mode");
    return saved || "widget";
  });
  const [widgetSize, setWidgetSize] = useState(() => {
    const saved = localStorage.getItem("chat_widget_size");
    return saved || "medium";
  });
  const [buttonPosition, setButtonPosition] = useState(() => {
    const saved = localStorage.getItem("chat_button_position");
    return saved
      ? JSON.parse(saved)
      : { x: window.innerWidth - 90, y: window.innerHeight - 90 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);
  const optionsRef = useRef(null);

  // Helper function to get responsive button size and margin
  const getButtonMetrics = useCallback(() => {
    const width = window.innerWidth;
    if (width <= 480) {
      return { buttonSize: 52, margin: 20 };
    } else if (width <= 768) {
      return { buttonSize: 56, margin: 20 };
    }
    return { buttonSize: 60, margin: 24 };
  }, []);

  // Save button position
  useEffect(() => {
    localStorage.setItem(
      "chat_button_position",
      JSON.stringify(buttonPosition)
    );
  }, [buttonPosition]);

  // Save widget size
  useEffect(() => {
    localStorage.setItem("chat_widget_size", widgetSize);
  }, [widgetSize]);

  // Handle responsive repositioning on window resize
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setButtonPosition((prev) => {
          const { buttonSize, margin } = getButtonMetrics();
          const maxX = window.innerWidth - buttonSize - margin;
          const maxY = window.innerHeight - buttonSize - margin;

          // Clamp position to valid bounds
          const x = Math.max(margin, Math.min(prev.x, maxX));
          const y = Math.max(margin, Math.min(prev.y, maxY));

          return { x, y };
        });
      }, 150); // Debounce to avoid excessive updates
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [getButtonMetrics]);

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showOptions]);

  const snapToCorner = useCallback((x, y) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const { buttonSize, margin } = getButtonMetrics();

    const corners = [
      { x: margin, y: margin },
      { x: windowWidth - buttonSize - margin, y: margin },
      { x: margin, y: windowHeight - buttonSize - margin },
      {
        x: windowWidth - buttonSize - margin,
        y: windowHeight - buttonSize - margin,
      },
    ];

    let nearest = corners[0];
    let minDistance = Math.hypot(x - corners[0].x, y - corners[0].y);

    corners.forEach((corner) => {
      const distance = Math.hypot(x - corner.x, y - corner.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = corner;
      }
    });

    return { x: nearest.x, y: nearest.y };
  }, [getButtonMetrics]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setHasMoved(false);
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // ✅ FIXED: Wrapped in useCallback to prevent unnecessary re-renders
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const moveThreshold = 5;
      const deltaX = Math.abs(e.clientX - dragOffset.x - buttonPosition.x);
      const deltaY = Math.abs(e.clientY - dragOffset.y - buttonPosition.y);

      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        setHasMoved(true);
      }

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setButtonPosition({ x: newX, y: newY });
    },
    [isDragging, dragOffset, buttonPosition]
  );

  // ✅ FIXED: Wrapped in useCallback
  const handleMouseUp = useCallback(
    (e) => {
      if (isDragging) {
        if (hasMoved) {
          const snapped = snapToCorner(buttonPosition.x, buttonPosition.y);
          setButtonPosition(snapped);
        }
        setIsDragging(false);

        // If didn't move significantly, open modal
        if (!hasMoved) {
          e.stopPropagation();
          setIsOpen(true);
        }

        setTimeout(() => setHasMoved(false), 100);
      }
    },
    [isDragging, hasMoved, buttonPosition, snapToCorner]
  );

  // ✅ FIXED: Added proper dependencies
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setHasMoved(false);
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  // ✅ FIXED: Wrapped in useCallback
  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      const moveThreshold = 5;
      const deltaX = Math.abs(touch.clientX - dragOffset.x - buttonPosition.x);
      const deltaY = Math.abs(touch.clientY - dragOffset.y - buttonPosition.y);

      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        setHasMoved(true);
      }

      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;
      setButtonPosition({ x: newX, y: newY });
    },
    [isDragging, dragOffset, buttonPosition]
  );

  // ✅ FIXED: Wrapped in useCallback
  const handleTouchEnd = useCallback(
    (e) => {
      if (isDragging) {
        if (hasMoved) {
          const snapped = snapToCorner(buttonPosition.x, buttonPosition.y);
          setButtonPosition(snapped);
        }
        setIsDragging(false);

        // If didn't move significantly, open modal
        if (!hasMoved) {
          e.preventDefault();
          setIsOpen(true);
        }

        setTimeout(() => setHasMoved(false), 100);
      }
    },
    [isDragging, hasMoved, buttonPosition, snapToCorner]
  );

  // ✅ FIXED: Added proper dependencies
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  const handleButtonClick = (e) => {
    // This will only fire if mouse handlers don't prevent it
    if (!isDragging && !hasMoved) {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowOptions(false);
  };

  const toggleChatMode = (mode) => {
    setChatMode(mode);
    localStorage.setItem("ai_chat_ui_mode", mode);
    setShowOptions(false);
  };

  const handleSizeChange = (size) => {
    setWidgetSize(size);
    setShowOptions(false);
  };

  const getWidgetStyles = () => {
    const sizes = {
      small: { width: "320px", height: "450px" },
      medium: { width: "400px", height: "600px" },
      large: { width: "500px", height: "700px" },
      fullscreen: {
        width: "calc(100vw - 48px)",
        height: "calc(100vh - 48px)",
        maxWidth: "1200px",
        maxHeight: "900px",
      },
    };
    return sizes[widgetSize] || sizes.medium;
  };

  return (
    <>
      {/* Floating Button - Only visible when chat is closed */}
      {!isOpen && (
        <button
          ref={buttonRef}
          className={`floating-chat-button ${theme === "dark" ? "dark" : ""} ${
            isDragging ? "dragging" : ""
          }`}
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
          }}
          onClick={handleButtonClick}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          aria-label="Open AI Assistant chat - Drag to reposition"
        >
          <i className="bi bi-cloud-fill" aria-hidden="true"></i>
        </button>
      )}

      {/* Drawer Mode */}
      {isOpen && chatMode === "drawer" && (
        <AIChatModal
          show={true}
          onClose={handleClose}
          onTaskGenerated={onTaskGenerated}
          theme={theme}
          refreshTasks={refreshTasks}
          isWidget={false}
          showOptions={showOptions}
          setShowOptions={setShowOptions}
          chatMode={chatMode}
          onModeChange={toggleChatMode}
          widgetSize={widgetSize}
          onSizeChange={handleSizeChange}
          optionsRef={optionsRef}
        />
      )}

      {/* Widget Mode */}
      {isOpen && chatMode === "widget" && (
        <div
          className={`floating-chat-modal ${theme === "dark" ? "dark" : ""} ${
            widgetSize === "fullscreen" ? "fullscreen" : ""
          }`}
          style={getWidgetStyles()}
        >
          <div className="floating-modal-header">
            <div className="modal-header-title">
              <i className="bi bi-robot"></i>
              <span>AI Assistant</span>
            </div>
            <div className="modal-header-actions">
              <div className="floating-options" ref={optionsRef}>
                <button
                  className="header-icon-button"
                  onClick={() => setShowOptions(!showOptions)}
                  aria-label="Options"
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
                      onClick={() => toggleChatMode("widget")}
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
                      onClick={() => toggleChatMode("drawer")}
                    >
                      <i className="bi bi-layout-sidebar"></i>
                      <span>Sidebar Drawer</span>
                      {chatMode === "drawer" && (
                        <i className="bi bi-check2"></i>
                      )}
                    </button>

                    {window.innerWidth > 768 && (
                      <>
                        <div className="options-divider"></div>

                        <div className="options-header">Window Size</div>
                        <button
                          className={`option-item ${
                            widgetSize === "small" ? "active" : ""
                          }`}
                          onClick={() => handleSizeChange("small")}
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
                          onClick={() => handleSizeChange("medium")}
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
                          onClick={() => handleSizeChange("large")}
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
                          onClick={() => handleSizeChange("fullscreen")}
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

              <button
                className="header-icon-button"
                onClick={handleClose}
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div className="floating-modal-body">
            <AIChatModal
              show={true}
              onClose={handleClose}
              onTaskGenerated={onTaskGenerated}
              theme={theme}
              refreshTasks={refreshTasks}
              isWidget={true}
            />
          </div>
        </div>
      )}

      {/* Drag Overlay */}
      {isDragging && <div className="drag-overlay" />}
    </>
  );
};

export default FloatingChatWidget;
