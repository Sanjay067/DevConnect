"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Like from './Like'
import Comment from './Comment'
import { resolveProfilePicture, resolveMediaSrc } from '@/shared/lib/imageHelpers'
import { useLikePost } from '../hooks/useLikePost';
import { useSelector } from 'react-redux';
import { renderMarkdown } from '../utils/markdownParser';
import { getTechIconClass } from '@/shared/lib/techIcons';

const getFirstMarkdownImage = (text) => {
    if (!text) return null;
    const match = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    return match ? match[1] : null;
};

function PostCard({ post }) {
    const { mutate: executeLikeMutation } = useLikePost();
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const currentUser = useSelector((state) => state.auth.user);
    const isOwnPost = post.author?._id === currentUser?._id;

    const markdownText = post.content?.blocks?.[0]?.data?.text || "";
    const firstImage = useMemo(() => {
        let img = getFirstMarkdownImage(markdownText);
        if (!img && post.media && post.media.length > 0) {
            const firstMediaItem = post.media.find(item => item.type === 'image');
            if (firstMediaItem) img = resolveMediaSrc(firstMediaItem);
        }
        return img;
    }, [markdownText, post.media]);

    const renderedMarkdown = useMemo(
        () => markdownText ? renderMarkdown(markdownText) : "",
        [markdownText]
    );

    const handleCommentBtn = () => {
        setIsCommentDialogOpen(!isCommentDialogOpen);
    }

    return (
        <div
            className="w-full max-w-2xl mx-auto my-5 rounded-2xl p-6 border border-zinc-800 transition-all duration-300 hover:border-zinc-700/60 hover:-translate-y-px z-10"
            style={{
                background: "var(--surface)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset, 0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
            }}
        >
            {/* 1. Header: Author Info & Follow/Edit Button */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3.5">
                    {/* Avatar — slightly larger with ring for micro-separation */}
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
                        <h3 className="font-semibold text-zinc-100 hover:text-emerald-400 tracking-tight leading-snug cursor-pointer transition-colors text-sm sm:text-base">
                            {post.author?.name || post.authorName}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            @{post.author?.username || post.authorUsername}
                            <span className="mx-1.5 text-[10px] text-zinc-700">•</span>
                            2h ago
                        </p>
                    </div>
                </div>

                {/* Follow button — now matches design language */}
                {!isOwnPost && (
                    <button className="border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/70 transition-all font-semibold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer">
                        Follow
                    </button>
                )}
                {isOwnPost && (
                    <Link
                        href={`/posts/${post._id}/edit`}
                        className="border border-zinc-800 text-zinc-400 bg-zinc-950/50 hover:bg-zinc-900 hover:text-zinc-100 rounded-lg px-3.5 py-1.5 font-medium text-xs transition-all cursor-pointer"
                    >
                        Edit
                    </Link>
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
            </div>

            {/* Subtle divider before image when image exists */}
            {!isExpanded && firstImage && (
                <div className="border-t border-zinc-800/40 mb-3" />
            )}

            {/* 3. Preview Image (collapsed) */}
            {!isExpanded && firstImage && (
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

            {/* 4. Expanded Markdown body */}
            {isExpanded && renderedMarkdown && (
                <div
                    className="mt-4 mb-4 text-sm text-zinc-300 leading-relaxed overflow-x-auto select-text"
                    dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                />
            )}

            {/* 5. View More / Links row */}
            <div className="flex items-center justify-between mb-4 mt-1">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-zinc-500 hover:text-emerald-400 font-medium text-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
                >
                    {isExpanded ? "Show less" : "View more"}
                    <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-right'} text-[9px]`}></i>
                </button>

                <div className="flex items-center gap-2.5">
                    {post.links?.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 border border-zinc-800 text-zinc-300 bg-zinc-950/40 hover:bg-zinc-800 hover:text-zinc-100 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer"
                        >
                            <i className={link.label === 'Github' ? "fa-brands fa-github text-sm" : "fa-solid fa-globe text-sm"}></i>
                            {link.label === 'Github' ? 'GitHub' : 'Live Demo'}
                        </a>
                    ))}
                </div>
            </div>

            {/* 6. Tech Stack Badges */}
            {!isExpanded && post.techStack && post.techStack.length > 0 && (
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

            {/* 7. Footer: Actions — with labels and Share */}
            <div className="flex items-center gap-5 pt-4 border-t border-zinc-800 text-zinc-500">

                <Like
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

                {/* Share */}
                <button className="flex items-center gap-1.5 transition-colors hover:text-zinc-300 cursor-pointer">
                    <i className="fa-solid fa-arrow-up-from-bracket text-xs"></i>
                    <span className="text-xs font-medium hidden sm:inline">Share</span>
                </button>

                {/* Bookmark — pushed to right */}
                <button className="flex items-center gap-1.5 ml-auto transition-colors hover:text-zinc-300 cursor-pointer">
                    <i className="fa-regular fa-bookmark text-sm"></i>
                </button>
            </div>

            {/* Comment section */}
            {isCommentDialogOpen && (
                <div className="mt-5 min-h-60 max-h-[600px] flex flex-col transition-all duration-300">
                    <Comment postId={post._id} />
                </div>
            )}
        </div>
    )
}

export default PostCard;
