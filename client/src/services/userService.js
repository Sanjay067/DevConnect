import { apiClient } from "@/services/apiClient";

export const getMyProfile = () => apiClient.get("/users/profiles/me");
export const updateMyProfile = (data) => apiClient.patch("/users/profiles/me", data);
export const updateAvatar = (formData) =>
  apiClient.patch("/users/profiles/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateUserAccount = (data) => apiClient.patch("/users/me", data);
export const getAllProfiles = (page = 1) =>
  apiClient.get("/users/profiles", { params: { page, limit: 24 } });
export const downloadProfilePdf = (userId) =>
  apiClient.get(`/users/profiles/download/${userId}`, { responseType: "blob" });
