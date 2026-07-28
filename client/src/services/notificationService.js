import { apiClient } from "@/services/apiClient";

export const getNotifications = () => apiClient.get("/notifications");

export const getUnreadNotificationsCount = () =>
  apiClient.get("/notifications/unread-count");

export const markNotificationsRead = () =>
  apiClient.patch("/notifications/mark-read");
