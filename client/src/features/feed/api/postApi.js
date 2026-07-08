
//Like
import { toggleLikePost, addComment, getComments, toggleLikeComment, getCommentReplies, addCommentReply, editComment, deleteComment } from "@/services/postService";


export const toggleLike = async (postId) => {
    const res = await toggleLikePost(postId);
    console.log("called to like");
    return res.data;
};

export const fetchComments = async (postId) => {
    const res = await getComments(postId);
    return res.data;
}

export const createComment = async ({ postId, body }) => {
    const res = await addComment({ postId, body });
    return res.data;
}

export const commentLike = async ({ postId, commentId }) => {
    const res = await toggleLikeComment(postId, commentId);
    return res.data;
}

export const fetchReplies = async ({ postId, commentId }) => {
    const res = await getCommentReplies(postId, commentId);
    return res.data;
}

export const createReply = async ({ postId, commentId, body }) => {
    const res = await addCommentReply({ postId, commentId, body });
    return res.data;
}

export const updateComment = async ({ postId, commentId, body }) => {
    const res = await editComment({ postId, commentId, body });
    return res.data;
}

export const removeComment = async ({ postId, commentId }) => {
    const res = await deleteComment({ postId, commentId });
    return res.data;
}
