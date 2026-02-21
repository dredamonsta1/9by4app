import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMessages,
  sendMessage,
  markAsRead,
} from "../../redux/actions/messagesActions";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import styles from "./MessagesPanel.module.css";

const ChatView = ({ conversationId, onBack }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const currentUser = useSelector((state) => state.auth.user);
  const messagesData = useSelector(
    (state) => state.messages.messages[conversationId]
  );
  const conversations = useSelector((state) => state.messages.conversations);

  const messagesList = messagesData?.list || [];
  const hasMore = messagesData?.hasMore || false;

  const conversation = conversations.find(
    (c) => c.conversation_id === conversationId
  );

  // Mark as read on open
  useEffect(() => {
    dispatch(markAsRead(conversationId));
  }, [dispatch, conversationId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList.length]);

  const handleLoadOlder = () => {
    if (messagesList.length > 0 && hasMore) {
      dispatch(fetchMessages(conversationId, messagesList[0].message_id));
    }
  };

  const handleSend = (content) => {
    dispatch(sendMessage(conversationId, content));
  };

  return (
    <div className={styles.chatView}>
      <div className={styles.chatHeader}>
        <button className={styles.backButton} onClick={onBack}>
          Back
        </button>
        <span className={styles.chatUsername}>
          {conversation?.other_username || "Chat"}
        </span>
      </div>

      <div className={styles.chatMessages}>
        {hasMore && (
          <button className={styles.loadOlderBtn} onClick={handleLoadOlder}>
            Load older messages
          </button>
        )}
        {messagesList.map((msg) => (
          <MessageBubble
            key={msg.message_id}
            message={msg}
            isOwn={msg.sender_id === currentUser?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
};

export default ChatView;
