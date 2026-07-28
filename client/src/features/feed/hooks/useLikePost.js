import { toggleLike } from "../api/postApi";
import { useQueryClient, useMutation } from "@tanstack/react-query";

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

export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleLike,

        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey: ["feed"] });
            await queryClient.cancelQueries({ queryKey: ["post", postId] });

            const previousFeed = queryClient.getQueryData(["feed"]);
            const previousPost = queryClient.getQueryData(["post", postId]);

            const toggleLikeOnPost = (post) => ({
                ...post,
                likeCount: post.isLiked
                    ? Math.max(0, (post.likeCount || 0) - 1)
                    : (post.likeCount || 0) + 1,
                isLiked: !post.isLiked,
            });

            queryClient.setQueryData(["feed"], (oldFeed) =>
                updateFeedCache(oldFeed, postId, toggleLikeOnPost)
            );

            queryClient.setQueryData(["post", postId], (oldData) => {
                if (!oldData) return oldData;
                if (oldData.post) {
                    return { ...oldData, post: toggleLikeOnPost(oldData.post) };
                }
                return toggleLikeOnPost(oldData);
            });

            return { previousFeed, previousPost };
        },

        onError: (err, postId, context) => {
            if (context?.previousFeed) {
                queryClient.setQueryData(["feed"], context.previousFeed);
            }
            if (context?.previousPost) {
                queryClient.setQueryData(["post", postId], context.previousPost);
            }
        },

        onSettled: (data, error, postId) => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            queryClient.invalidateQueries({ queryKey: ["post", postId] });
        },
    });
};