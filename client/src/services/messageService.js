import { apiClient } from "@/services/apiClient";

export const getConversations = (page = 1) =>
  apiClient.get("/messages/conversations", { params: { page } });

export const getConversationMessages = (peerId, page = 1) =>
  apiClient.get(`/messages/${peerId}`, { params: { page } });

export const sendMessage = (peerId, body) =>
  apiClient.post(`/messages/${peerId}`, { body });

export const getUnreadCount = () =>
  apiClient.get("/messages/unread-count");

export const deleteMessage = (messageId) =>
  apiClient.delete(`/messages/delete/${messageId}`);
