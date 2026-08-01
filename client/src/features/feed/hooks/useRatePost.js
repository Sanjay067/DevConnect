import { useRef, useCallback } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { ratePost } from "@/services/postService";

// ── Cache helpers ─────────────────────────────────────────────────────────────

const applyRatingUpdate = (post, targetScore) => {
  if (!post) return post;

  const currentScore = post.userRatingScore ?? null;
  const currentTotal = post.totalPoints ?? 0;
  const currentCount = post.ratingCount ?? 0;

  let newScore = null;
  let newTotal = currentTotal;
  let newCount = currentCount;

  if (currentScore === targetScore) {
    // Toggle off: user clicked their current score again (un-rate)
    newScore = null;
    newTotal = Math.max(0, currentTotal - targetScore);
    newCount = Math.max(0, currentCount - 1);
  } else if (currentScore !== null) {
    // Score change (e.g. 6 to 9) — no count change, just totalPoints delta
    newScore = targetScore;
    newTotal = Math.max(0, currentTotal + (targetScore - currentScore));
    newCount = currentCount;
  } else {
    // First rating on this post
    newScore = targetScore;
    newTotal = currentTotal + targetScore;
    newCount = currentCount + 1;
  }

  const newAvg = newCount > 0 ? Number((newTotal / newCount).toFixed(1)) : 0;

  return {
    ...post,
    userRatingScore: newScore,
    totalPoints: newTotal,
    ratingCount: newCount,
    averageRating: newAvg,
    isLiked: newScore !== null,
  };
};

const updateFeedCache = (oldFeed, postId, updateFn) => {
  if (!oldFeed) return oldFeed;
  // Infinite query: { pages: [{ posts: [] }, ...] }
  if (oldFeed.pages) {
    return {
      ...oldFeed,
      pages: oldFeed.pages.map((page) => ({
        ...page,
        posts: (page.posts || []).map((p) =>
          String(p._id) === postId ? updateFn(p) : p
        ),
      })),
    };
  }
  // Standard query: { posts: [] }
  if (oldFeed.posts) {
    return {
      ...oldFeed,
      posts: oldFeed.posts.map((p) =>
        String(p._id) === postId ? updateFn(p) : p
      ),
    };
  }
  return oldFeed;
};

const updateUserPostsCache = (oldData, postId, updateFn) => {
  if (!oldData) return oldData;
  if (Array.isArray(oldData)) {
    return oldData.map((p) => (String(p._id) === postId ? updateFn(p) : p));
  }
  if (oldData.posts) {
    return {
      ...oldData,
      posts: oldData.posts.map((p) => (String(p._id) === postId ? updateFn(p) : p)),
    };
  }
  return oldData;
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useRatePost = () => {
  const queryClient = useQueryClient();
  const abortCtrlRef = useRef(null);
  const debounceRef = useRef(null);

  const mutation = useMutation({
    mutationFn: ({ postId, score, signal }) => ratePost({ postId, score, signal }),

    onMutate: async ({ postId, score }) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      await queryClient.cancelQueries({ queryKey: ["userPosts"] });

      const previousFeed = queryClient.getQueryData(["feed"]);
      const previousPost = queryClient.getQueryData(["post", postId]);

      // Optimistic update — feed
      queryClient.setQueryData(["feed"], (old) =>
        updateFeedCache(old, postId, (p) => applyRatingUpdate(p, score))
      );
      // Optimistic update — single post detail
      queryClient.setQueryData(["post", postId], (old) => {
        if (!old) return old;
        if (old.post) return { ...old, post: applyRatingUpdate(old.post, score) };
        return applyRatingUpdate(old, score);
      });
      // Optimistic update — userPosts (profile view)
      queryClient.setQueriesData({ queryKey: ["userPosts"] }, (old) =>
        updateUserPostsCache(old, postId, (p) => applyRatingUpdate(p, score))
      );

      return { previousFeed, previousPost };
    },

    onError: (_err, { postId }, context) => {
      if (context?.previousFeed)
        queryClient.setQueryData(["feed"], context.previousFeed);
      if (context?.previousPost)
        queryClient.setQueryData(["post", postId], context.previousPost);
    },

    onSuccess: (data, { postId }) => {
      const updated = data?.data;
      if (!updated) return;

      const serverPatch = (p) => ({
        ...p,
        userRatingScore: updated.userRatingScore ?? null,
        totalPoints: updated.totalPoints ?? p.totalPoints,
        averageRating: updated.averageRating ?? p.averageRating,
        ratingCount: updated.ratingCount ?? p.ratingCount,
        likeCount: updated.likeCount ?? p.likeCount,
        isLiked: updated.userRatingScore !== null,
      });

      queryClient.setQueryData(["feed"], (old) =>
        updateFeedCache(old, postId, serverPatch)
      );
      queryClient.setQueryData(["post", postId], (old) => {
        if (!old) return old;
        if (old.post) return { ...old, post: serverPatch(old.post) };
        return serverPatch(old);
      });
      queryClient.setQueriesData({ queryKey: ["userPosts"] }, (old) =>
        updateUserPostsCache(old, postId, serverPatch)
      );
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  /**
   * Debounced rate — UI updates immediately every click,
   * but the network request fires only after 300ms of inactivity.
   * Previous in-flight requests are aborted via AbortController.
   */
  const debouncedRate = useCallback(
    (postId, score) => {
      // Cancel in-flight stale request
      if (abortCtrlRef.current) abortCtrlRef.current.abort();
      const controller = new AbortController();
      abortCtrlRef.current = controller;

      // Cancel pending timer
      if (debounceRef.current) clearTimeout(debounceRef.current);

      // Apply optimistic update immediately via onMutate
      queryClient.setQueryData(["feed"], (old) =>
        updateFeedCache(old, postId, (p) => applyRatingUpdate(p, score))
      );
      queryClient.setQueryData(["post", postId], (old) => {
        if (!old) return old;
        if (old.post) return { ...old, post: applyRatingUpdate(old.post, score) };
        return applyRatingUpdate(old, score);
      });
      queryClient.setQueriesData({ queryKey: ["userPosts"] }, (old) =>
        updateUserPostsCache(old, postId, (p) => applyRatingUpdate(p, score))
      );

      // Schedule actual network request after 300ms pause
      debounceRef.current = setTimeout(() => {
        mutation.mutate({ postId, score, signal: controller.signal });
      }, 300);
    },
    [mutation, queryClient]
  );

  return { ...mutation, debouncedRate };
};
