"use client"

import React, { useEffect, useState, useRef } from 'react';
import { useComments, useAddComment, useLikeComment, useReplies, useAddReply, useEditComment, useDeleteComment } from '../hooks/useComments';
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


      <div className="flex justify-between items-center px-5 py-3 border-b border-zinc-800 bg-zinc-900 z-10 shrink-0">
        <h2 className="font-semibold text-zinc-100 text-sm">Comments</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-zinc-900 flex flex-col gap-5">
        {isLoading && <div className="text-zinc-500 text-center mt-10 text-xs font-medium">Loading comments...</div>}
        {isError && <div className="text-red-500/80 text-center mt-10 text-xs font-medium">Failed to load comments.</div>}
        {!isLoading && commentsData?.comments?.length === 0 && (
          <div className="text-zinc-500 text-center mt-10 text-xs font-medium">No comments yet. Be the first!</div>
        )}


        {!isLoading && commentsData?.comments?.map((comment) => (
          <CommentItem key={comment._id} comment={comment} postId={postId} />
        ))}

      </div>


      <div className="p-4 border-t border-zinc-800 bg-zinc-900 shrink-0">
        <div className="flex gap-2">

          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition-all"
            name='comment'
            value={commentInput}
            onChange={handleChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0 disabled:opacity-40 cursor-pointer"
            onClick={handleSubmit}
            disabled={isPending || !commentInput.trim()}
          >
            {isPending ? (
              <i className="fa-solid fa-circle-notch fa-spin text-xs"></i>
            ) : (
              <i className="fa-solid fa-paper-plane text-xs"></i>
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
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { data: repliesData, isLoading: isRepliesLoading } = useReplies(postId, comment._id, isRepliesExpanded);
  const { mutate: submitReply, isPending: isReplySubmitting } = useAddReply();
  const { mutate: executeLikeComment } = useLikeComment();
  const { mutate: executeEditComment, isPending: isEditPending } = useEditComment();
  const { mutate: executeDeleteComment, isPending: isDeletePending } = useDeleteComment();

  const currentUser = useSelector((state) => state.auth.user);
  const isOwnComment = String(comment.author?._id) === String(currentUser?._id);

  const replyInputContainerRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditSubmit = () => {
    if (!editBody.trim() || editBody.trim() === comment.body) {
      setIsEditing(false);
      return;
    }
    executeEditComment(
      { postId, commentId: comment._id, body: editBody.trim() },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleDelete = () => {
    setShowMenu(false);
    executeDeleteComment({ postId, commentId: comment._id });
  };

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
        <div className={`rounded-full overflow-hidden shrink-0 mt-1 border border-zinc-800 ${isReply ? 'w-8 h-8' : 'w-10 h-10'}`}>
          {comment.author?.profilePicture ? (
            <img src={resolveProfilePicture(comment.author.profilePicture)} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-zinc-850"></div>
          )}
        </div>

        <div className="flex flex-col flex-1 max-w-[85%]">
          <div className={`rounded-r-2xl rounded-bl-2xl rounded-tl-sm px-4 py-2.5 ${isReply ? 'bg-zinc-950/60' : 'bg-zinc-950'}`}>
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-zinc-100 hover:text-emerald-400 cursor-pointer transition-colors ${isReply ? 'text-xs' : 'text-sm'}`}>
                {comment.author?.name}
              </span>
              <span className="text-[10px] text-zinc-500 font-normal translate-y-[1px]">
                {formatTimeAgo(comment.createdAt)}
              </span>
              {!isOwnComment && (
                <>
                  <span className="text-zinc-600 text-[10px] translate-y-[1px]">•</span>
                  <button className="text-emerald-500 hover:text-emerald-400 font-bold transition-all text-xs translate-y-[1px] cursor-pointer">
                    Follow
                  </button>
                </>
              )}
              {/* Three-dot menu for own comments */}
              {isOwnComment && (
                <div className="relative ml-auto" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu((p) => !p)}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <i className="fa-solid fa-ellipsis text-[10px]"></i>
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 top-7 z-50 w-36 rounded-xl border border-zinc-800 shadow-xl overflow-hidden"
                      style={{ background: "var(--surface)" }}>
                      <button
                        onClick={() => { setIsEditing(true); setEditBody(comment.body); setShowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-pen text-[10px] text-zinc-500"></i>
                        Edit comment
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeletePending}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <i className="fa-solid fa-trash text-[10px]"></i>
                        {isDeletePending ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comment body / edit input */}
            {isEditing ? (
              <div className="mt-2 flex gap-2">
                <input
                  autoFocus
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSubmit();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={handleEditSubmit}
                  disabled={isEditPending}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isEditPending ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Save'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className={`text-zinc-300 mt-1 leading-snug whitespace-pre-wrap ${isReply ? 'text-xs' : 'text-sm'}`}>
                {comment.isDeleted ? <span className="italic text-zinc-600">This comment was deleted.</span> : comment.body}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 ml-2 text-[11px] font-semibold text-zinc-500">
            <Like
              initialLiked={comment.isLiked}
              initialLikeCount={comment.likeCount || 0}
              onToggle={() => executeLikeComment({ postId, commentId: comment._id })}
            />

            {!isReply && (
              <>
                <div className="w-[1px] h-3 bg-zinc-800"></div>
                <button
                  onClick={() => setIsRepliesExpanded(!isRepliesExpanded)}
                  className="hover:bg-zinc-800/40 px-2 py-1 rounded-md transition-colors text-zinc-500 hover:text-zinc-300 font-semibold cursor-pointer"
                >
                  Reply {comment.replyCount > 0 && `(${comment.replyCount})`}
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {isRepliesExpanded && !isReply && (
        <div className="ml-5 pl-6 border-l-2 border-zinc-800 flex flex-col gap-4 mt-2 mb-2">
          {isRepliesLoading && <div className="text-xs text-zinc-500">Loading replies...</div>}

          {!isRepliesLoading && repliesData?.replies?.map((reply) => (
            <CommentItem key={reply._id} comment={reply} postId={postId} isReply={true} />
          ))}

          <div ref={replyInputContainerRef} className="flex gap-2 mt-1">
            <input
              type="text"
              placeholder="Reply to this comment..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition-all"
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
            />
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold w-7 h-7 flex items-center justify-center rounded-xl transition-colors shrink-0 disabled:opacity-40 cursor-pointer"
              onClick={handleReplySubmit}
              disabled={isReplySubmitting || !replyInput.trim()}
            >
              {isReplySubmitting ? (
                <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i>
              ) : (
                <i className="fa-solid fa-paper-plane text-[10px]"></i>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Comment;


