import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser, unfollowUser } from "@/services/followService";

export const useFollow = (currentUser) => {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: followUser,
    onMutate: async (targetUserId) => {
      await queryClient.cancelQueries({ queryKey: ["following", currentUser?._id] });

      const previousFollowing = queryClient.getQueryData(["following", currentUser?._id]);

      // Optimistically add to following set
      queryClient.setQueryData(["following", currentUser?._id], (old) => {
        const list = old?.following || [];
        return {
          ...old,
          following: [...list, { followingId: { _id: targetUserId } }]
        };
      });

      return { previousFollowing };
    },
    onError: (err, targetUserId, context) => {
      queryClient.setQueryData(["following", currentUser?._id], context.previousFollowing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following", currentUser?._id] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onMutate: async (targetUserId) => {
      await queryClient.cancelQueries({ queryKey: ["following", currentUser?._id] });

      const previousFollowing = queryClient.getQueryData(["following", currentUser?._id]);

      // Optimistically remove from following set
      queryClient.setQueryData(["following", currentUser?._id], (old) => {
        const list = old?.following || [];
        return {
          ...old,
          following: list.filter((f) => String(f.followingId?._id || f.followingId) !== String(targetUserId))
        };
      });

      return { previousFollowing };
    },
    onError: (err, targetUserId, context) => {
      queryClient.setQueryData(["following", currentUser?._id], context.previousFollowing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following", currentUser?._id] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    }
  });

  return {
    follow: (userId) => followMutation.mutate(userId),
    unfollow: (userId) => unfollowMutation.mutate(userId),
    isPending: followMutation.isPending || unfollowMutation.isPending,
    activeVariables: followMutation.isPending ? followMutation.variables : unfollowMutation.variables
  };
};
