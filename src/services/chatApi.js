import api from "./api";

const chatApi = {
  // Send a message to a recipient
  sendMessage: async (recipientId, message, messageType = "text", attachmentUrl = null) => {
    const response = await api.post("/chat/send", {
      recipientId,
      message,
      messageType,
      attachmentUrl,
    });
    return response.data;
  },

  // Get conversation history with a specific user
  getConversation: async (userId, limit = 50) => {
    const response = await api.get(`/chat/conversation/${userId}?limit=${limit}`);
    return response.data;
  },

  // Get all conversations for the current user
  getUserConversations: async () => {
    const response = await api.get("/chat/conversations");
    return response.data;
  },

  // Get total unread message count
  getUnreadCount: async () => {
    const response = await api.get("/chat/unread-count");
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (messageIds) => {
    const response = await api.post("/chat/mark-as-read", {
      messageIds,
    });
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/chat/message/${messageId}`);
    return response.data;
  },

  // Search conversations
  searchConversations: async (query) => {
    const response = await api.get(`/chat/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default chatApi;
