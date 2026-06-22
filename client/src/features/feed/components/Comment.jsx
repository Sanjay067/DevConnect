"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useComments, useAddComment, useLikeComment, useReplies, useAddReply } from '../hooks/useComments';
import { resolveProfilePicture } from '@/shared/lib/imageHelpers';
import Like from './Like';
import { useSelector } from 'react-redux';

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInDays < 30) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
};





function Comment({ postId }) {
  const { data: commentsData, isLoading, isError } = useComments(postId);
  const { mutate: submitComment, isPending } = useAddComment();
  const { mutate: executeLikeComment } = useLikeComment();

  const handleSubmit = () => {
    if (!commentInput.trim()) return;

    submitComment({ postId, body: commentInput }, {
      onSuccess: () => {
        setCommentInput("");
      }
    });
  }


  const [commentInput, setCommentInput] = useState("");

  const handleChange = (e) => {
    setCommentInput(e.target.value);
  }


  return (

    < div className="flex flex-col h-full" >


      <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-white z-10 shrink-0">
        <h2 className="font-bold text-gray-900 text-[1.1rem]">Comments</h2>
      </div>


      <div className="flex-1 p-4 overflow-y-auto bg-white flex flex-col gap-5">
        {isLoading && <div className="text-gray-500 text-center mt-10">Loading comments...</div>}
        {isError && <div className="text-red-500 text-center mt-10">Failed to load comments.</div>}
        {!isLoading && commentsData?.comments?.length === 0 && (
          <div className="text-gray-500 text-center mt-10">No comments yet. Be the first!</div>
        )}


        {!isLoading && commentsData?.comments?.map((comment) => (
          <CommentItem key={comment._id} comment={comment} postId={postId} />
        ))}

      </div>


      <div className="p-4 border-t border-gray-100 bg-white shrink-0">
        <div className="flex gap-2">

          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            name='comment'
            value={commentInput}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-10 h-10 flex items-center justify-center rounded-full transition-colors shrink-0 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={isPending || !commentInput.trim()}
          >
            {isPending ? (
              <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>
            ) : (
              <i className="fa-solid fa-paper-plane text-sm translate-y-[1px] -translate-x-[1px]"></i>
            )}
          </button>
        </div>
      </div>

    </div >
  )
}

function CommentItem({ comment, postId, isReply = false }) {
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const { data: repliesData, isLoading: isRepliesLoading } = useReplies(postId, comment._id, isRepliesExpanded);
  const { mutate: submitReply, isPending: isReplySubmitting } = useAddReply();
  const { mutate: executeLikeComment } = useLikeComment();

  const currentUser = useSelector((state) => state.auth.user);
  const isOwnComment = comment.author?._id === currentUser?._id;

  const replyInputContainerRef = useRef(null);

  useEffect(() => {
    if (isRepliesExpanded) {
      setTimeout(() => {
        replyInputContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
        const inputElement = replyInputContainerRef.current?.querySelector('input');
        inputElement?.focus();
      }, 150);
    }
  }, [isRepliesExpanded]);

  const handleReplySubmit = () => {
    if (!replyInput.trim()) return;

    submitReply(
      { postId, commentId: comment._id, body: replyInput },
      {
        onSuccess: () => {
          setReplyInput("");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 group">
        <div className={`rounded-full overflow-hidden shrink-0 mt-1 border border-gray-100 ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
          {comment.author?.profilePicture ? (
            <img src={resolveProfilePicture(comment.author.profilePicture)} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gray-200"></div>
          )}
        </div>

        <div className="flex flex-col flex-1 max-w-[85%]">
          <div className={`rounded-r-2xl rounded-bl-2xl rounded-tl-sm px-4 py-2.5 ${isReply ? 'bg-[#f9f9f9]' : 'bg-[#f2f2f2]'}`}>
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-gray-900 hover:text-blue-600 cursor-pointer ${isReply ? 'text-xs' : 'text-sm'}`}>
                {comment.author?.name}
              </span>
              <span className="text-[10px] text-gray-400 font-normal translate-y-[1px]">
                {formatTimeAgo(comment.createdAt)}
              </span>
              {!isOwnComment && (
                <>
                  <span className="text-gray-300 text-[10px] translate-y-[1px]">•</span>
                  <button className="text-blue-600 hover:text-blue-800 hover:underline font-bold transition-all text-xs translate-y-[1px]">
                    Follow
                  </button>
                </>
              )}
            </div>
            <p className={`text-gray-800 mt-1 leading-snug whitespace-pre-wrap ${isReply ? 'text-xs' : 'text-sm'}`}>
              {comment.body}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1 ml-2 text-xs font-semibold text-gray-500">
            <Like
              initialLiked={comment.isLiked}
              initialLikeCount={comment.likeCount || 0}
              onToggle={() => executeLikeComment({ postId, commentId: comment._id })}
            />

            {!isReply && (
              <>
                <div className="w-[1px] h-3 bg-gray-300"></div>
                <button
                  onClick={() => setIsRepliesExpanded(!isRepliesExpanded)}
                  className="hover:bg-gray-100 px-2 py-1 rounded transition-colors text-gray-500 hover:text-gray-800 font-semibold"
                >
                  Reply {comment.replyCount > 0 && `(${comment.replyCount})`}
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {isRepliesExpanded && !isReply && (
        <div className="ml-5 pl-6 border-l-2 border-gray-100 flex flex-col gap-4 mt-2 mb-2">
          {isRepliesLoading && <div className="text-xs text-gray-500">Loading replies...</div>}

          {!isRepliesLoading && repliesData?.replies?.map((reply) => (
            <CommentItem key={reply._id} comment={reply} postId={postId} isReply={true} />
          ))}

          <div ref={replyInputContainerRef} className="flex gap-2 mt-1">
            <input
              type="text"
              placeholder="Reply to this comment..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-8 h-8 flex items-center justify-center rounded-full transition-colors shrink-0 disabled:opacity-50"
              onClick={handleReplySubmit}
              disabled={isReplySubmitting || !replyInput.trim()}
            >
              {isReplySubmitting ? (
                <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
              ) : (
                <i className="fa-solid fa-paper-plane text-xs translate-y-[0.5px]"></i>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Comment;


