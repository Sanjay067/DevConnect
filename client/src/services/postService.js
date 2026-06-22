
//Post Service
import { apiClient } from "@/services/apiClient";

export const toggleLikePost = (postId) => {
    return apiClient.post(`/posts/${postId}/like`);
}

//Comments

export const getComments = (postId) => {
    return apiClient.get(`/posts/${postId}/comments`);
}

export const addComment = ({ postId, body }) => {
    return apiClient.post(`/posts/${postId}/comments`, { body });
}

export const toggleLikeComment = (postId, commentId) => {
    return apiClient.post(`/posts/${postId}/comments/${commentId}/like`);
}

export const getCommentReplies = (postId, commentId) => {
    return apiClient.get(`/posts/${postId}/comments/${commentId}/replies`);
}

export const addCommentReply = ({ postId, commentId, body }) => {
    return apiClient.post(`/posts/${postId}/comments/${commentId}/replies`, { body });
}

export const createPost = (formData) => {
    return apiClient.post("/posts", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};


