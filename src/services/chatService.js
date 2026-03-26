import apiClient from "./api";

export const chatService = {
  createOrGetConversationByProduct: async (productId) => {
    const response = await apiClient.post(`/chat/conversations/product/${productId}`);
    return response.data;
  },
  listConversations: async () => {
    const response = await apiClient.get("/chat/conversations");
    return response.data;
  },
  listMessages: async (conversationId) => {
    const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  },
  sendMessage: async (conversationId, text) => {
    const response = await apiClient.post(`/chat/conversations/${conversationId}/messages`, {
      text,
    });
    return response.data;
  },
};
