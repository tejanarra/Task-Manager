import React, { useState, useEffect, useRef } from "react";
import { demoConversation, demoTasks } from "./data";
import TaskCard from "../tasks/taskItem/TaskCard";
import "./Styles/DemoSection.css";

const DemoSection = ({ theme }) => {
  const [activeDemo, setActiveDemo] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Reset chat when switching back
  useEffect(() => {
    if (activeDemo === "chat") {
      setMessages([]);
      setCurrentMessageIndex(0);
      setIsTyping(false);
    }
  }, [activeDemo]);

  // Message playback
  useEffect(() => {
    if (
      activeDemo !== "chat" ||
      currentMessageIndex >= demoConversation.length
    ) {
      return;
    }

    const message = demoConversation[currentMessageIndex];
    const delay = currentMessageIndex === 0 ? 500 : 2000;

    const timer = setTimeout(() => {
      if (message.role === "assistant") {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, message]);
          setCurrentMessageIndex((prev) => prev + 1);
        }, 1500);
      } else {
        setMessages((prev) => [...prev, message]);
        setCurrentMessageIndex((prev) => prev + 1);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [activeDemo, currentMessageIndex]);

  // Auto-scroll
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length, isTyping]);

  const restartDemo = () => {
    setMessages([]);
    setCurrentMessageIndex(0);
    setIsTyping(false);
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <section className="lp-demo">
      <div className="lp-demo-header">
        <h2>See It In Action</h2>
        <p>Experience how our AI-powered task manager works</p>
      </div>

      <div className="lp-demo-tabs">
        <button
          className={`lp-demo-tab ${activeDemo === "chat" ? "active" : ""}`}
          onClick={() => setActiveDemo("chat")}
        >
          <i className="bi bi-chat-dots"></i>
          AI Chat Mode
        </button>
        <button
          className={`lp-demo-tab ${activeDemo === "tasks" ? "active" : ""}`}
          onClick={() => setActiveDemo("tasks")}
        >
          <i className="bi bi-list-check"></i>
          Task Management
        </button>
      </div>

      <div className="lp-demo-content">
        {/* -------------------- CHAT DEMO -------------------- */}
        {activeDemo === "chat" ? (
          <div className={`lp-demo-chat ${theme === "dark" ? "dark" : ""}`}>
            <div className="lp-demo-chat-header">
              <div className="lp-demo-chat-title">
                <i className="bi bi-robot"></i>
                <span>AI Task Assistant</span>
              </div>
              <button className="lp-demo-restart" onClick={restartDemo}>
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>

            <div className="lp-demo-chat-messages" ref={messagesContainerRef}>
              {messages.length === 0 && !isTyping && (
                <div className="lp-demo-empty">
                  <i className="bi bi-chat-heart"></i>
                  <p>Watch the AI assistant in action...</p>
                </div>
              )}

              {messages.map((msg, index) => (
                <div key={index} className={`lp-demo-message ${msg.role}`}>
                  <div className="lp-demo-message-avatar">
                    {msg.role === "user" ? (
                      <i className="bi bi-person-circle"></i>
                    ) : (
                      <i className="bi bi-robot"></i>
                    )}
                  </div>
                  <div className="lp-demo-message-content">
                    <div className="lp-demo-message-text">
                      {msg.content}
                      <div className="lp-demo-message-time">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="lp-demo-message assistant">
                  <div className="lp-demo-message-avatar">
                    <i className="bi bi-robot"></i>
                  </div>
                  <div className="lp-demo-message-content">
                    <div className="lp-demo-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} style={{ height: "1px" }} />
            </div>

            <div className="lp-demo-chat-input">
              <input type="text" placeholder="Type your message..." disabled />
              <button disabled>
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </div>
        ) : (
          /* -------------------- TASK DEMO -------------------- */
          <div className={`lp-demo-tasks ${theme === "dark" ? "dark" : ""}`}>
            <div className="lp-demo-tasks-header">
              <h3>Your Tasks</h3>
              <span className="lp-demo-task-count">
                {demoTasks.length} tasks
              </span>
            </div>

            <div className="lp-demo-tasks-list">
              {demoTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="lp-demo-task-wrapper"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Reuse real TaskCard UI */}
                  <TaskCard theme={theme} task={task} demoMode={true} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="lp-demo-features">
        <div className="lp-demo-feature">
          <i className="bi bi-lightning-charge"></i>
          <h4>Instant Task Creation</h4>
          <p>Create tasks in seconds with natural language</p>
        </div>
        <div className="lp-demo-feature">
          <i className="bi bi-chat-quote"></i>
          <h4>Conversational Updates</h4>
          <p>Update tasks through simple conversations</p>
        </div>
        <div className="lp-demo-feature">
          <i className="bi bi-bell-fill"></i>
          <h4>Smart Reminders</h4>
          <p>Never miss a deadline with intelligent alerts</p>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
