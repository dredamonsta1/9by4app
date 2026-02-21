import React from "react";
import styles from "./MessagesPanel.module.css";

const ConversationItem = ({ conversation, isActive, onClick }) => {
  const time = conversation.last_message_at
    ? new Date(conversation.last_message_at).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      })
    : "";

  const preview = conversation.last_message
    ? conversation.last_message.length > 40
      ? conversation.last_message.slice(0, 40) + "..."
      : conversation.last_message
    : "No messages yet";

  return (
    <div
      className={`${styles.conversationItem} ${isActive ? styles.conversationItemActive : ""}`}
      onClick={onClick}
    >
      <div className={styles.convAvatar}>
        {conversation.other_username?.[0]?.toUpperCase() || "?"}
      </div>
      <div className={styles.convInfo}>
        <div className={styles.convHeader}>
          <span className={styles.convUsername}>
            {conversation.other_username}
          </span>
          <span className={styles.convTime}>{time}</span>
        </div>
        <p className={styles.convPreview}>{preview}</p>
      </div>
      {parseInt(conversation.unread_count) > 0 && (
        <span className={styles.unreadBadge}>{conversation.unread_count}</span>
      )}
    </div>
  );
};

export default ConversationItem;
