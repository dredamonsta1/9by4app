import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import messageService from "../services/messageService";

export default function useMessages() {
  const dispatch = useDispatch();
  const {
    conversations,
    activeConversationId,
    messages,
    totalUnreadCount,
    loading,
    error,
  } = useSelector((state) => state.messages);

  // Start/stop global polling on mount/unmount
  useEffect(() => {
    messageService.startListening(dispatch);
    return () => messageService.stopAll();
  }, [dispatch]);

  // Start/stop active conversation polling when it changes
  useEffect(() => {
    if (activeConversationId) {
      messageService.startConversationPolling(dispatch, activeConversationId);
    } else {
      messageService.stopConversationPolling();
    }
    return () => messageService.stopConversationPolling();
  }, [activeConversationId, dispatch]);

  const activeMessages = activeConversationId
    ? messages[activeConversationId]
    : null;

  return {
    conversations,
    activeConversationId,
    activeMessages,
    totalUnreadCount,
    loading,
    error,
  };
}
