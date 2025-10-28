import React, { useState, useRef, useEffect } from "react";
import { sendAIChatMessage, generateAITask } from "../../services/api";
import ChatMessage from "./ChatMessage";
import { useAuth } from "../../context/AuthContext";

const ChatMode = ({ setError, setPreviewTask, theme }) => {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

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

  const resetChat = () => {
    setChatMessages([]);
    setError(null);
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
        {chatMessages.length === 0 ? (
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
          <i className="bi bi-eye me-1"></i> Preview
        </button>
      </div>
    </div>
  );
};

export default ChatMode;
