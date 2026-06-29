import { apiClient } from "@/services/apiClient";

export const followUser = (followingId) =>
  apiClient.post(`/follows/${followingId}`);

export const unfollowUser = (followingId) =>
  apiClient.delete(`/follows/${followingId}`);

export const getFollowing = (userId) =>
  apiClient.get(`/follows/${userId}/following`);

export const getFollowers = (userId) =>
  apiClient.get(`/follows/${userId}/followers`);
