import React from "react";
import styles from "./MessagesPanel.module.css";

const MessageBubble = ({ message, isOwn }) => {
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`${styles.bubble} ${isOwn ? styles.bubbleSent : styles.bubbleReceived}`}>
      <p className={styles.bubbleContent}>{message.content}</p>
      <span className={styles.bubbleTime}>{time}</span>
    </div>
  );
};

export default MessageBubble;
