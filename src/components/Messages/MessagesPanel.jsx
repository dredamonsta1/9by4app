import React from "react";
import { useDispatch } from "react-redux";
import { setActiveConversation } from "../../redux/messagesSlice";
import useMessages from "../../hooks/useMessages";
import ConversationList from "./ConversationList";
import ChatView from "./ChatView";
import styles from "./MessagesPanel.module.css";

const MessagesPanel = () => {
  const dispatch = useDispatch();
  const { conversations, activeConversationId, totalUnreadCount } =
    useMessages();

  const handleSelectConversation = (id) => {
    dispatch(setActiveConversation(id));
  };

  const handleBack = () => {
    dispatch(setActiveConversation(null));
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>
          Messages
          {totalUnreadCount > 0 && (
            <span className={styles.headerBadge}>{totalUnreadCount}</span>
          )}
        </h2>
      </div>

      <div className={styles.panelBody}>
        {activeConversationId ? (
          <ChatView
            conversationId={activeConversationId}
            onBack={handleBack}
          />
        ) : (
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
          />
        )}
      </div>
    </div>
  );
};

export default MessagesPanel;
