import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeed } from "@/features/feed/api/feedApi";
import { createPost, getPostById, updatePost, deletePost } from "@/services/postService";

export const useFeed = () => {
    return useQuery({
        queryKey: ["feed"],
        queryFn: getFeed,
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
        },
    });
};

export const usePost = (postId) => {
    return useQuery({
        queryKey: ["post", postId],
        queryFn: () => getPostById(postId).then((res) => res.data.post),
        enabled: !!postId,
    });
};

export const useUpdatePost = (postId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) => updatePost(postId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
        },
    });
};

export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
        },
    });
};