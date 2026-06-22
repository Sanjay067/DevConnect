import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeed } from "@/features/feed/api/feedApi";
import { createPost } from "@/services/postService";

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