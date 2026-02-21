import {
  fetchConversations,
  fetchMessages,
  fetchUnreadCount,
} from "../redux/actions/messagesActions";

class MessageService {
  constructor() {
    this.conversationInterval = null;
    this.unreadInterval = null;
    this.activeConversationInterval = null;
  }

  // Start global polling: conversations every 15s, unread count every 10s
  startListening(dispatch) {
    this.stopAll();

    // Initial fetch
    dispatch(fetchConversations());
    dispatch(fetchUnreadCount());

    this.conversationInterval = setInterval(() => {
      dispatch(fetchConversations());
    }, 15000);

    this.unreadInterval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 10000);
  }

  // Poll active conversation messages every 5s
  startConversationPolling(dispatch, conversationId) {
    this.stopConversationPolling();

    // Initial fetch
    dispatch(fetchMessages(conversationId));

    this.activeConversationInterval = setInterval(() => {
      dispatch(fetchMessages(conversationId));
    }, 5000);
  }

  stopConversationPolling() {
    if (this.activeConversationInterval) {
      clearInterval(this.activeConversationInterval);
      this.activeConversationInterval = null;
    }
  }

  stopAll() {
    if (this.conversationInterval) {
      clearInterval(this.conversationInterval);
      this.conversationInterval = null;
    }
    if (this.unreadInterval) {
      clearInterval(this.unreadInterval);
      this.unreadInterval = null;
    }
    this.stopConversationPolling();
  }
}

// Singleton instance — future: swap internals with socket.on(...) listeners
const messageService = new MessageService();
export default messageService;
