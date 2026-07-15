"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Like from './Like';
import Comment from './Comment';
import { resolveProfilePicture, resolveMediaSrc } from '@/shared/lib/imageHelpers';
import { useLikePost } from '../hooks/useLikePost';
import { useSelector } from 'react-redux';
import { getTechIconClass } from '@/shared/lib/techIcons';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser, unfollowUser } from "@/services/followService";

import { deletePost, toggleFeaturePost } from "@/services/postService";

// ── Time formatter ───────────────────────────────────────────────────────────
const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getFirstMarkdownImage = (text) => {
    if (!text) return null;
    const match = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    return match ? match[1] : null;
};

function PostCard({ post, showMenu }) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const handleCardClick = (e) => {
        const interactiveSelectors = 'a, button, input, [role="button"], select, textarea';
        if (e.target.closest(interactiveSelectors)) {
            return;
        }
        router.push(`/posts/${post._id}`);
    };
    const { mutate: executeLikeMutation } = useLikePost();
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const currentUser = useSelector((state) => state.auth.user);
    const isOwnPost = post.author?._id === currentUser?._id;

    const featureMutation = useMutation({
        mutationFn: () => toggleFeaturePost(post._id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            queryClient.invalidateQueries({ queryKey: ["myPosts"] });
            queryClient.invalidateQueries({ queryKey: ["userPosts", post.author?._id] });
            queryClient.invalidateQueries({ queryKey: ["profile", post.author?._id] });
        },
    });

    const markdownText = post.content?.blocks?.[0]?.data?.text || "";
    const firstImage = useMemo(() => {
        let img = getFirstMarkdownImage(markdownText);
        if (!img && post.media && post.media.length > 0) {
            const firstMediaItem = post.media.find(item => item.type === 'image');
            if (firstMediaItem) img = resolveMediaSrc(firstMediaItem);
        }
        return img;
    }, [markdownText, post.media]);

    const followMutation = useMutation({
        mutationFn: () => isFollowing ? unfollowUser(post.author?._id) : followUser(post.author?._id),
        onMutate: () => setIsFollowing(prev => !prev),
        onError: () => setIsFollowing(prev => !prev),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["following"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feed"] });
            queryClient.invalidateQueries({ queryKey: ["myPosts"] });
            queryClient.invalidateQueries({ queryKey: ["userPosts", post.author?._id] });
        },
    });

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            deleteMutation.mutate(post._id);
        }
    };

    const handleCommentBtn = () => {
        setIsCommentDialogOpen(!isCommentDialogOpen);
    };

    const authorId = post.author?._id;

    return (
        <div
            onClick={handleCardClick}
            className="w-full max-w-2xl mx-auto my-5 rounded-2xl p-6 border border-zinc-800 transition-all duration-300 hover:border-zinc-700/60 hover:-translate-y-px z-10 cursor-pointer"
            style={{
                background: "var(--surface)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset, 0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
            }}
        >
            {/* 1. Header: Author Info & Follow/Edit Button */}
            <div className="flex items-center justify-between mb-5">
                <Link href={authorId ? `/profile/${authorId}` : "#"} className="flex items-center gap-3.5 group">
                    {/* Avatar */}
                    <div className="relative w-11 h-11 rounded-full overflow-hidden ring-1 ring-zinc-800 shrink-0">
                        {(post.author?.profilePicture || post.authorProfilePicture) ? (
                            <img
                                src={resolveProfilePicture(post.author?.profilePicture || post.authorProfilePicture)}
                                alt={post.author?.name || post.authorName || "Author"}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900"></div>
                        )}
                    </div>

                    {/* Name + username */}
                    <div>
                        <h3 className="font-semibold text-zinc-100 group-hover:text-emerald-400 tracking-tight leading-snug transition-colors text-sm sm:text-base">
                            {post.author?.name || post.authorName}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            @{post.author?.username || post.authorUsername}
                            <span className="mx-1.5 text-[10px] text-zinc-700">•</span>
                            {formatTimeAgo(post.createdAt)}
                        </p>
                    </div>
                </Link>

                {/* Follow / Edit button */}
                {!isOwnPost && (
                    <button
                        onClick={() => followMutation.mutate()}
                        disabled={followMutation.isPending}
                        className={`border font-semibold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer transition-all disabled:opacity-60 ${
                            isFollowing
                                ? "border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                                : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/70"
                        }`}
                    >
                        {followMutation.isPending ? (
                            <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                        ) : isFollowing ? "Following" : "Follow"}
                    </button>
                )}
                {isOwnPost && showMenu && (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowDropdown(prev => !prev)}
                            className="w-8 h-8 rounded-lg hover:bg-zinc-850 border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center cursor-pointer transition-all"
                        >
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>

                        {showDropdown && (
                            <>
                                <div 
                                    className="fixed inset-0 z-30 cursor-default" 
                                    onClick={() => setShowDropdown(false)}
                                />
                                <div className="absolute right-0 mt-1.5 z-45 min-w-[150px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <Link
                                        href={`/posts/${post._id}/edit`}
                                        className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
                                    >
                                        <i className="fa-regular fa-pen-to-square"></i>
                                        Edit Project
                                    </Link>
                                    
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDropdown(false);
                                            featureMutation.mutate();
                                        }}
                                        disabled={featureMutation.isPending}
                                        className="w-full text-left px-3 py-2 text-xs font-bold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                                    >
                                        <i className="fa-regular fa-star"></i>
                                        {post.isFeatured ? "Unfeature" : "Feature to top"}
                                    </button>

                                    <div className="h-px bg-zinc-900 my-1" />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDropdown(false);
                                            handleDelete();
                                        }}
                                        disabled={deleteMutation.isPending}
                                        className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                                    >
                                        <i className="fa-regular fa-trash-can"></i>
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* 2. Body: Title + Description */}
            <div className="flex flex-col gap-2 mb-4">
                <h2 className="text-xl font-extrabold text-zinc-50 tracking-tight leading-snug">
                    {post.title}
                </h2>

                {post.shortDescription && (
                    <p className="text-sm text-zinc-400 font-normal leading-relaxed">
                        {post.shortDescription}
                    </p>
                )}

                {/* Looking for Contributors badge */}
                {post.lookingForContributors && (
                    <div className="inline-flex items-center gap-1.5 self-start mt-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        <i className="fa-solid fa-handshake text-[10px]"></i>
                        Looking for Contributors
                    </div>
                )}
            </div>

            {/* Subtle divider before image when image exists */}
            {firstImage && (
                <div className="border-t border-zinc-800/40 mb-3" />
            )}

            {/* 3. Preview Image */}
            {firstImage && (
                <div className="mb-4 max-w-full rounded-xl overflow-hidden group cursor-pointer"
                    style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
                    <img
                        src={firstImage}
                        alt={post.title}
                        className="w-full h-auto mx-auto object-cover max-h-[380px] transition-transform duration-500 group-hover:scale-[1.015]"
                        loading="lazy"
                    />
                </div>
            )}

            {/* 5. View More link → navigates to detail page */}
            <div className="flex flex-wrap items-center justify-between gap-y-2.5 mb-4 mt-1">
                <Link
                    href={`/posts/${post._id}`}
                    className="text-zinc-500 hover:text-emerald-400 font-medium text-xs flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap"
                >
                    View more
                    <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                </Link>

                <div className="flex items-center gap-2.5">
                    {post.links?.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 border border-zinc-800 text-zinc-350 bg-zinc-950/40 hover:bg-zinc-850 hover:text-zinc-100 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer"
                        >
                            <i className={link.label === 'Github' ? "fa-brands fa-github text-sm" : "fa-solid fa-globe text-sm"}></i>
                            {link.label === 'Github' ? 'GitHub' : 'Live Demo'}
                        </a>
                    ))}
                </div>
            </div>

            {/* 6. Tech Stack Badges */}
            {post.techStack && post.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {post.techStack.map((tech, idx) => {
                        const iconClass = getTechIconClass(tech);
                        return (
                            <span key={idx} className="bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-emerald-500/40 hover:text-zinc-200 hover:bg-emerald-500/5 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 capitalize select-none transition-all duration-200">
                                {iconClass && <i className={`${iconClass} text-xs`}></i>}
                                {tech}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* 7. Footer: Actions */}
            <div className="flex items-center gap-5 pt-4 border-t border-zinc-800 text-zinc-500">
                <Like
                    key={`${post._id}-${post.isLiked}-${post.likeCount}`}
                    initialLiked={post.isLiked}
                    initialLikeCount={post.likeCount || 0}
                    onToggle={() => executeLikeMutation(post._id)}
                />

                {/* Comment */}
                <button
                    className="flex items-center gap-1.5 transition-colors hover:text-zinc-300 cursor-pointer"
                    onClick={handleCommentBtn}
                >
                    <i className="fa-regular fa-comment text-sm"></i>
                    <span className="font-medium text-xs leading-none">{post.commentCount || 0}</span>
                    <span className="text-xs font-medium hidden sm:inline">Discuss</span>
                </button>
            </div>

            {/* Comment section */}
            {isCommentDialogOpen && (
                <div className="mt-5 min-h-60 max-h-[600px] flex flex-col transition-all duration-300">
                    <Comment postId={post._id} />
                </div>
            )}
        </div>
    );
}

export default PostCard;
