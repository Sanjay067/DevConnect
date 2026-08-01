import {
  getComments,
  addComment,
  toggleLikeComment,
  getCommentReplies,
  addCommentReply,
  editComment,
  deleteComment,
} from "@/services/postService";
import { useQueryClient, useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";

export const useComments = (postId) => {
    return useInfiniteQuery({
        queryKey: ["comments", postId],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await getComments(postId, pageParam, 5);
            return res.data;
        },
        enabled: !!postId,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page >= Math.ceil(lastPage.total / lastPage.limit)) return undefined;
            return lastPage.page + 1;
        },
    });
};


export const useAddComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, body }) => {
            const res = await addComment({ postId, body });
            return res.data;
        },

        onMutate: async ({ postId }) => {
            await queryClient.cancelQueries({ queryKey: ["feed"] });
            const previousFeed = queryClient.getQueryData(["feed"]);

            queryClient.setQueryData(["feed"], (oldFeed) => {
                if (!oldFeed?.posts) return oldFeed;
                return {
                    ...oldFeed,
                    posts: oldFeed.posts.map((post) =>
                        post._id === postId
                            ? { ...post, commentCount: (post.commentCount || 0) + 1 }
                            : post
                    ),
                };
            });

            return { previousFeed };
        },

        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
        },

        onError: (err, variables, context) => {
            if (context?.previousFeed) {
                queryClient.setQueryData(["feed"], context.previousFeed);
            }
        }
    });
};

export const useLikeComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, commentId }) => {
            const res = await toggleLikeComment(postId, commentId);
            return res.data;
        },
        onMutate: async ({ postId, commentId }) => {
            await queryClient.cancelQueries({ queryKey: ["comments", postId] });

            const previousComments = queryClient.getQueryData(["comments", postId]);

            queryClient.setQueryData(["comments", postId], (oldData) => {
                if (!oldData?.pages) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        comments: page.comments.map((comment) =>
                            comment._id === commentId
                                ? {
                                      ...comment,
                                      likeCount: comment.isLiked
                                          ? (comment.likeCount || 0) - 1
                                          : (comment.likeCount || 0) + 1,
                                      isLiked: !comment.isLiked,
                                  }
                                : comment
                        ),
                    })),
                };
            });

            return { previousComments, postId };
        },
        onError: (err, variables, context) => {
            if (context?.previousComments) {
                queryClient.setQueryData(["comments", context.postId], context.previousComments);
            }
        },
    });
};

export const useReplies = (postId, commentId, isExpanded) => {
    return useInfiniteQuery({
        queryKey: ["replies", commentId],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await getCommentReplies(postId, commentId, pageParam, 5);
            return res.data;
        },
        enabled: !!commentId && !!isExpanded,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (lastPage.page >= Math.ceil(lastPage.total / lastPage.limit)) return undefined;
            return lastPage.page + 1;
        },
    });
};

export const useAddReply = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, commentId, body }) => {
            const res = await addCommentReply({ postId, commentId, body });
            return res.data;
        },
        onMutate: async ({ postId, commentId }) => {
            await queryClient.cancelQueries({ queryKey: ["comments", postId] });

            const previousComments = queryClient.getQueryData(["comments", postId]);

            queryClient.setQueryData(["comments", postId], (oldData) => {
                if (!oldData?.pages) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        comments: page.comments.map((comment) =>
                            comment._id === commentId
                                ? { ...comment, replyCount: (comment.replyCount || 0) + 1 }
                                : comment
                        ),
                    })),
                };
            });

            return { previousComments, postId };
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["replies", variables.commentId] });
        },
        onError: (err, variables, context) => {
            if (context?.previousComments) {
                queryClient.setQueryData(["comments", context.postId], context.previousComments);
            }
        },
    });
};

export const useEditComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ postId, commentId, body }) => {
            const res = await editComment({ postId, commentId, body });
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
            queryClient.invalidateQueries({ queryKey: ["replies", variables.commentId] });
        },
    });
};

export const useDeleteComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ postId, commentId }) => {
            const res = await deleteComment({ postId, commentId });
            return res.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
            queryClient.invalidateQueries({ queryKey: ["replies", variables.commentId] });
        },
    });
};
