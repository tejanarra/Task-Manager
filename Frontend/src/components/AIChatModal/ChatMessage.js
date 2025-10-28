import React from "react";

const ChatMessage = ({ msg, user, theme }) => {
  const userAvatar = user.avatar;
  const initials =
    (user.firstName?.[0]?.toUpperCase() || "") +
    (user.lastName?.[0]?.toUpperCase() || "");
  const displayInitials = initials || "?";

  return (
    <div className={`chat-message ${msg.role}`}>
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
                border: theme === "dark" ? "1px solid #fff" : "1px solid #000",
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
                border: theme === "dark" ? "1px solid #fff" : "1px solid #000",
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
  );
};

export default ChatMessage;
