"use client";

const ChatMessage = ({ msg, user, theme }) => {
  const userAvatar = user.avatar;
  const initials =
    (user.firstName?.[0]?.toUpperCase() || "") +
    (user.lastName?.[0]?.toUpperCase() || "");
  const displayInitials = initials || "?";

  // Format timestamp for WhatsApp-like display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    // If message is from today, show time only
    if (diffInHours < 24 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If yesterday
    if (diffInHours < 48 && date.getDate() === now.getDate() - 1) {
      return `Yesterday ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Otherwise show date and time
    return (
      date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      }) +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  // Format message content with basic markdown-like formatting
  const formatMessageContent = (content) => {
    if (!content) return "";

    // Split by numbered lists (1., 2., etc.)
    const parts = content.split(/(\d+\.\s+[^\n]+)/g);

    return parts.map((part, index) => {
      // Check if this is a numbered list item
      if (/^\d+\.\s+/.test(part)) {
        const match = part.match(/^(\d+)\.\s+(.+)/);
        if (match) {
          return (
            <div
              key={index}
              style={{ marginLeft: "0.5rem", marginTop: "0.25rem" }}
            >
              <strong>{match[1]}.</strong> {match[2]}
            </div>
          );
        }
      }

      // Process inline formatting
      const processedPart = part
        .split(/(\*\*[^*]+\*\*)/g) // Bold text
        .map((segment, i) => {
          if (segment.startsWith("**") && segment.endsWith("**")) {
            return <strong key={i}>{segment.slice(2, -2)}</strong>;
          }
          return segment;
        });

      return <span key={index}>{processedPart}</span>;
    });
  };

  return (
    <div className={`chat-message ${msg.role}`}>
      <div className="message-avatar">
        {msg.role === "user" ? (
          userAvatar ? (
            <img
              src={userAvatar}
              alt="User"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: theme === "dark" ? "#ffffff" : "#000000",
                color: theme === "dark" ? "#000000" : "#ffffff",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
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
        <div className="message-text">
          <div className="message-text-content">
            {formatMessageContent(msg.content)}
          </div>
          <div className="message-time">
            {formatTime(msg.timestamp)}
            {msg.role === "user" && (
              <i
                className="bi bi-check-all"
                style={{ fontSize: "0.75rem" }}
              ></i>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
