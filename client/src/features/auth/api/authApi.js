import { apiClient } from "@/services/apiClient";

export const login = (data) => apiClient.post("/auth/login", data);
export const register = (data) => apiClient.post("/auth/signup", data);