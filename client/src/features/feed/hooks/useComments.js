import { fetchComments, createComment, commentLike, fetchReplies, createReply, updateComment, removeComment } from "../api/postApi";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";

export const useComments = (postId) => {
    return useQuery({
        queryKey: ["comments", postId],
        queryFn: () => fetchComments(postId),
        enabled: !!postId,
    });
};


export const useAddComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createComment,

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
        mutationFn: commentLike,
        onMutate: async ({ postId, commentId }) => {
            await queryClient.cancelQueries({ queryKey: ["comments", postId] });

            const previousComments = queryClient.getQueryData(["comments", postId]);

            queryClient.setQueryData(["comments", postId], (oldComments) => {
                if (!oldComments?.comments) return oldComments;

                return {
                    ...oldComments,
                    comments: oldComments.comments.map((comment) =>
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
    return useQuery({
        queryKey: ["replies", commentId],
        queryFn: () => fetchReplies({ postId, commentId }),
        enabled: !!commentId && !!isExpanded,
    });
};

export const useAddReply = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createReply,
        onMutate: async ({ postId, commentId }) => {
            await queryClient.cancelQueries({ queryKey: ["comments", postId] });

            const previousComments = queryClient.getQueryData(["comments", postId]);

            queryClient.setQueryData(["comments", postId], (oldComments) => {
                if (!oldComments?.comments) return oldComments;

                return {
                    ...oldComments,
                    comments: oldComments.comments.map((comment) =>
                        comment._id === commentId
                            ? { ...comment, replyCount: (comment.replyCount || 0) + 1 }
                            : comment
                    ),
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
        mutationFn: updateComment,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
            queryClient.invalidateQueries({ queryKey: ["replies", variables.commentId] });
        },
    });
};

export const useDeleteComment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: removeComment,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["comments", variables.postId] });
            queryClient.invalidateQueries({ queryKey: ["feed"] });
        },
    });
};
