import { apiClient } from "@/services/apiClient";

export const getFeed = (page = 1, limit = 20) => apiClient.get(`/feed?page=${page}&limit=${limit}`);
