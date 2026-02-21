import React from "react";
import ConversationItem from "./ConversationItem";
import styles from "./MessagesPanel.module.css";

const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
}) => {
  if (conversations.length === 0) {
    return (
      <p className={styles.emptyState}>
        No conversations yet. Follow someone and they follow you back to start
        messaging.
      </p>
    );
  }

  return (
    <div className={styles.conversationList}>
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.conversation_id}
          conversation={conv}
          isActive={conv.conversation_id === activeConversationId}
          onClick={() => onSelectConversation(conv.conversation_id)}
        />
      ))}
    </div>
  );
};

export default ConversationList;
