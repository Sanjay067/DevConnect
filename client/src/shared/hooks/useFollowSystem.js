import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { followUser, unfollowUser, getFollowing, getFollowers } from "@/services/followService";
import { useMemo } from "react";

export function useFollowSystem() {
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.user);
  const myId = currentUser?._id;

  // 1. Fetch current user's following list
  const { data: followingData } = useQuery({
    queryKey: ["following", myId],
    queryFn: () => getFollowing(myId).then((res) => res.data),
    enabled: !!myId,
    staleTime: 1000 * 60 * 5,
  });

  // 2. Fetch current user's followers list (to detect mutual followers / follow back state)
  const { data: followersData } = useQuery({
    queryKey: ["followers", myId],
    queryFn: () => getFollowers(myId).then((res) => res.data),
    enabled: !!myId,
    staleTime: 1000 * 60 * 5,
  });

  const followingSet = useMemo(() => {
    const list = followingData?.following || [];
    return new Set(
      list.map((f) => String(f.followingId?._id || f.followingId))
    );
  }, [followingData]);

  const followersSet = useMemo(() => {
    const list = followersData?.followers || [];
    return new Set(
      list.map((f) => String(f.followerId?._id || f.followerId))
    );
  }, [followersData]);

  const followMutation = useMutation({
    mutationFn: (targetUserId) => followUser(targetUserId),
    onMutate: async (targetUserId) => {
      await queryClient.cancelQueries({ queryKey: ["following", myId] });
      const previousFollowing = queryClient.getQueryData(["following", myId]);

      queryClient.setQueryData(["following", myId], (old) => {
        const list = old?.following || [];
        return {
          ...old,
          following: [...list, { followingId: { _id: targetUserId } }],
        };
      });

      return { previousFollowing };
    },
    onError: (err, targetUserId, context) => {
      if (context?.previousFollowing) {
        queryClient.setQueryData(["following", myId], context.previousFollowing);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["following", myId] });
      queryClient.invalidateQueries({ queryKey: ["followers", myId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (targetUserId) => unfollowUser(targetUserId),
    onMutate: async (targetUserId) => {
      await queryClient.cancelQueries({ queryKey: ["following", myId] });
      const previousFollowing = queryClient.getQueryData(["following", myId]);

      queryClient.setQueryData(["following", myId], (old) => {
        const list = old?.following || [];
        return {
          ...old,
          following: list.filter(
            (f) => String(f.followingId?._id || f.followingId) !== String(targetUserId)
          ),
        };
      });

      return { previousFollowing };
    },
    onError: (err, targetUserId, context) => {
      if (context?.previousFollowing) {
        queryClient.setQueryData(["following", myId], context.previousFollowing);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["following", myId] });
      queryClient.invalidateQueries({ queryKey: ["followers", myId] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const getFollowStatus = (targetUserId) => {
    if (!targetUserId || !myId) return "not_following";
    const idStr = String(targetUserId);
    if (idStr === String(myId)) return "self";
    if (followingSet.has(idStr)) return "following";
    if (followersSet.has(idStr)) return "follow_back";
    return "not_following";
  };

  const toggleFollow = (targetUserId) => {
    const status = getFollowStatus(targetUserId);
    if (status === "self") return;
    if (status === "following") {
      unfollowMutation.mutate(targetUserId);
    } else {
      followMutation.mutate(targetUserId);
    }
  };

  const isPending = followMutation.isPending || unfollowMutation.isPending;
  const activeTargetId = followMutation.isPending
    ? followMutation.variables
    : unfollowMutation.variables;

  return {
    getFollowStatus,
    toggleFollow,
    isFollowing: (targetUserId) => followingSet.has(String(targetUserId)),
    isFollowedBy: (targetUserId) => followersSet.has(String(targetUserId)),
    isPending,
    activeTargetId,
    followingSet,
    followersSet,
  };
}
