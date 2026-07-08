import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPublicUserProfile } from "@/services/userService";
import { followUser, unfollowUser } from "@/services/followService";
import { getPublicUserPosts } from "@/services/postService";

export const useProfile = (userId) => {
    return useQuery({
        queryKey: ["profile", userId],
        queryFn: () => getPublicUserProfile(userId).then(res => res.data),
        enabled: !!userId,
    });
};

export const useToggleFollow = (userId, isCurrentlyFollowing) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => isCurrentlyFollowing ? unfollowUser(userId) : followUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile", userId] });
        },
    });
};

export const useUserPosts = (userId) => {
    return useQuery({
        queryKey: ["userPosts", userId],
        queryFn: () => getPublicUserPosts(userId).then(res => res.data.posts),
        enabled: !!userId,
    });
};
