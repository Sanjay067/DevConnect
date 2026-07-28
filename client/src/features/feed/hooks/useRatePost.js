import { ratePost } from "@/services/postService";
import { useQueryClient, useMutation } from "@tanstack/react-query";

const helperUpdatePost = (post, targetScore) => {
  if (!post) return post;
  const currentScore = post.userRatingScore || (post.isLiked ? 10 : null);
  const currentTotal = post.totalPoints ?? ((post.likeCount || 0) * 10);
  const currentCount = post.ratingCount ?? (post.likeCount || 0);

  let newScore = null;
  let newTotal = currentTotal;
  let newCount = currentCount;

  if (currentScore === targetScore) {
    // Toggle off (un-rate)
    newScore = null;
    newTotal = Math.max(0, currentTotal - targetScore);
    newCount = Math.max(0, currentCount - 1);
  } else if (currentScore != null) {
    // Score change (e.g. 5 -> 8)
    newScore = targetScore;
    newTotal = Math.max(0, currentTotal + (targetScore - currentScore));
  } else {
    // New rating
    newScore = targetScore;
    newTotal = currentTotal + targetScore;
    newCount = currentCount + 1;
  }

  const newAverage = newCount > 0 ? Number((newTotal / newCount).toFixed(1)) : 0;

  return {
    ...post,
    userRatingScore: newScore,
    isLiked: !!newScore,
    totalPoints: newTotal,
    ratingCount: newCount,
    likeCount: newCount,
    averageRating: newAverage,
  };
};

const updateFeedCache = (oldFeed, postId, updateFn) => {
  if (!oldFeed) return oldFeed;
  // Handle Infinite Query structure ({ pages: [{ posts: [] }, ...] })
  if (oldFeed.pages) {
    return {
      ...oldFeed,
      pages: oldFeed.pages.map((page) => ({
        ...page,
        posts: (page.posts || []).map((p) => (p._id === postId ? updateFn(p) : p)),
      })),
    };
  }
  // Handle standard query structure ({ posts: [] })
  if (oldFeed.posts) {
    return {
      ...oldFeed,
      posts: oldFeed.posts.map((p) => (p._id === postId ? updateFn(p) : p)),
    };
  }
  return oldFeed;
};

export const useRatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, score }) => ratePost({ postId, score }),

    onMutate: async ({ postId, score }) => {
      // 1. Cancel outgoing queries for feed & post so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });

      // 2. Snapshot previous cache for error rollback
      const previousFeed = queryClient.getQueryData(["feed"]);
      const previousPost = queryClient.getQueryData(["post", postId]);

      // 3. Optimistically update infinite feed query cache in 0ms
      queryClient.setQueryData(["feed"], (oldFeed) =>
        updateFeedCache(oldFeed, postId, (p) => helperUpdatePost(p, score))
      );

      // 4. Optimistically update single post query cache in 0ms
      queryClient.setQueryData(["post", postId], (oldData) => {
        if (!oldData) return oldData;
        if (oldData.post) {
          return { ...oldData, post: helperUpdatePost(oldData.post, score) };
        }
        return helperUpdatePost(oldData, score);
      });

      return { previousFeed, previousPost };
    },

    onError: (err, { postId }, context) => {
      // Rollback on network failure
      if (context?.previousFeed) {
        queryClient.setQueryData(["feed"], context.previousFeed);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(["post", postId], context.previousPost);
      }
    },

    onSuccess: (data, { postId }) => {
      const updatedPost = data?.data?.post;
      if (updatedPost) {
        // Silently write exact authoritative server response into infinite query cache
        queryClient.setQueryData(["feed"], (oldFeed) =>
          updateFeedCache(oldFeed, postId, (p) => ({ ...p, ...updatedPost }))
        );

        queryClient.setQueryData(["post", postId], (oldData) => {
          if (!oldData) return oldData;
          if (oldData.post) {
            return { ...oldData, post: { ...oldData.post, ...updatedPost } };
          }
          return { ...oldData, ...updatedPost };
        });
      }
    },
  });
};
