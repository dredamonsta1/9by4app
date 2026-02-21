import axiosInstance from "../../utils/axiosInstance";
import {
  setLoading,
  setError,
  setConversations,
  setMessages,
  appendMessage,
  prependMessages,
  setTotalUnreadCount,
  markConversationRead,
  updateConversationPreview,
} from "../messagesSlice";

export const fetchConversations = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await axiosInstance.get("/messages/conversations");
    dispatch(setConversations(res.data));
  } catch (err) {
    console.error("Error fetching conversations:", err);
    dispatch(setError(err.message));
  }
};

export const fetchMessages =
  (conversationId, before = null) =>
  async (dispatch) => {
    try {
      const params = before ? `?before=${before}&limit=30` : "?limit=30";
      const res = await axiosInstance.get(
        `/messages/conversations/${conversationId}${params}`
      );
      if (before) {
        dispatch(
          prependMessages({
            conversationId,
            messages: res.data.messages,
            hasMore: res.data.hasMore,
          })
        );
      } else {
        dispatch(
          setMessages({
            conversationId,
            messages: res.data.messages,
            hasMore: res.data.hasMore,
          })
        );
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      dispatch(setError(err.message));
    }
  };

export const sendMessage = (conversationId, content) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `/messages/conversations/${conversationId}`,
      { content }
    );
    dispatch(appendMessage({ conversationId, message: res.data }));
    dispatch(
      updateConversationPreview({ conversationId, message: res.data })
    );
  } catch (err) {
    console.error("Error sending message:", err);
    dispatch(setError(err.message));
  }
};

export const createConversation = (recipientId) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/messages/conversations", {
      recipient_id: recipientId,
    });
    // Refresh conversation list to include the new one
    dispatch(fetchConversations());
    return res.data.conversation_id;
  } catch (err) {
    console.error("Error creating conversation:", err);
    dispatch(setError(err.message));
    return null;
  }
};

export const markAsRead = (conversationId) => async (dispatch) => {
  try {
    await axiosInstance.patch(
      `/messages/conversations/${conversationId}/read`
    );
    dispatch(markConversationRead(conversationId));
  } catch (err) {
    console.error("Error marking as read:", err);
  }
};

export const fetchUnreadCount = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get("/messages/unread-count");
    dispatch(setTotalUnreadCount(res.data.count));
  } catch (err) {
    console.error("Error fetching unread count:", err);
  }
};

export const checkCanDM = async (userId) => {
  try {
    const res = await axiosInstance.get(`/messages/check-dm/${userId}`);
    return res.data;
  } catch (err) {
    console.error("Error checking DM:", err);
    return { canDM: false, reason: "Error checking" };
  }
};
