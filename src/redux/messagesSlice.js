import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  totalUnreadCount: 0,
  loading: false,
  error: null,
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    setConversations(state, action) {
      state.conversations = action.payload;
      state.loading = false;
    },
    setMessages(state, action) {
      const { conversationId, messages, hasMore } = action.payload;
      state.messages[conversationId] = { list: messages, hasMore };
      state.loading = false;
    },
    appendMessage(state, action) {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = { list: [], hasMore: false };
      }
      // Avoid duplicates
      const exists = state.messages[conversationId].list.some(
        (m) => m.message_id === message.message_id
      );
      if (!exists) {
        state.messages[conversationId].list.push(message);
      }
    },
    prependMessages(state, action) {
      const { conversationId, messages, hasMore } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = { list: [], hasMore: false };
      }
      state.messages[conversationId].list = [
        ...messages,
        ...state.messages[conversationId].list,
      ];
      state.messages[conversationId].hasMore = hasMore;
    },
    setActiveConversation(state, action) {
      state.activeConversationId = action.payload;
    },
    setTotalUnreadCount(state, action) {
      state.totalUnreadCount = action.payload;
    },
    markConversationRead(state, action) {
      const convId = action.payload;
      const conv = state.conversations.find(
        (c) => c.conversation_id === convId
      );
      if (conv) {
        conv.unread_count = 0;
      }
    },
    updateConversationPreview(state, action) {
      const { conversationId, message } = action.payload;
      const conv = state.conversations.find(
        (c) => c.conversation_id === conversationId
      );
      if (conv) {
        conv.last_message = message.content;
        conv.last_message_at = message.created_at;
        conv.last_sender_id = message.sender_id;
        conv.updated_at = message.created_at;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setConversations,
  setMessages,
  appendMessage,
  prependMessages,
  setActiveConversation,
  setTotalUnreadCount,
  markConversationRead,
  updateConversationPreview,
} = messagesSlice.actions;

export default messagesSlice.reducer;
