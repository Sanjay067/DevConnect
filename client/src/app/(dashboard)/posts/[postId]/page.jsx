"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { usePost } from "@/features/feed/hooks/useFeed";
import { renderMarkdown } from "@/features/feed/utils/markdownParser";
import { getTechIconClass } from "@/shared/lib/techIcons";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";
import { useLikePost } from "@/features/feed/hooks/useLikePost";
import Comment from "@/features/feed/components/Comment";
import Like from "@/features/feed/components/Like";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost } from "@/services/postService";

// ── Time formatter ──────────────────────────────────────────────────────────
const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ── Skeleton loader ─────────────────────────────────────────────────────────
function PostDetailSkeleton() {
  return (
    <div className="animate-pulse max-w-3xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-zinc-800" />
        <div className="space-y-2">
          <div className="h-3 w-32 rounded bg-zinc-800" />
          <div className="h-2.5 w-24 rounded bg-zinc-800" />
        </div>
      </div>
      <div className="h-9 w-3/4 rounded-lg bg-zinc-800" />
      <div className="h-4 w-full rounded bg-zinc-800" />
      <div className="h-4 w-5/6 rounded bg-zinc-800" />
      <div className="h-4 w-4/6 rounded bg-zinc-800" />
      <div className="h-64 rounded-xl bg-zinc-800" />
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function PostDetailPage() {
  const { postId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.user);
  const { mutate: executeLikeMutation } = useLikePost();

  const { data: post, isLoading, isError } = usePost(postId);

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myPosts"] });
      router.push("/feed");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(postId);
    }
  };

  const markdownText = post?.content?.blocks?.[0]?.data?.text || "";
  const renderedMarkdown = useMemo(
    () => (markdownText ? renderMarkdown(markdownText) : ""),
    [markdownText]
  );

  // ── Loading / Error states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <PostDetailSkeleton />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--bg)" }}>
        <i className="fa-solid fa-triangle-exclamation text-3xl text-zinc-600"></i>
        <p className="text-zinc-500 text-sm">Post not found or failed to load.</p>
        <Link href="/feed"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
          ← Back to Feed
        </Link>
      </div>
    );
  }

  const isAuthor = post.isAuthor;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── Article body ──────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Author row — profile left, links + edit right */}
        <div className="flex items-center justify-between gap-3 mb-8">
          {/* Left: avatar + name */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-1 ring-zinc-800 shrink-0">
              {post.author?.profilePicture ? (
                <img
                  src={resolveProfilePicture(post.author.profilePicture)}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100 leading-snug">{post.author?.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                @{post.author?.username}
                <span className="mx-1.5 text-zinc-700">•</span>
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>

          {/* Right: GitHub / Live Demo + Edit */}
          <div className="flex items-center gap-2 shrink-0">
            {post.links?.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 bg-zinc-950/50 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
              >
                <i className={link.label === "Github" ? "fa-brands fa-github text-sm" : "fa-solid fa-globe text-sm"}></i>
                {link.label === "Github" ? "GitHub" : "Live Demo"}
              </a>
            ))}
            {isAuthor && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/posts/${post._id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 text-xs font-semibold transition-all"
                >
                  <i className="fa-solid fa-pen text-[10px]"></i>
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-950/40 bg-red-950/10 text-red-400 hover:bg-red-950/20 hover:text-red-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  {deleteMutation.isPending ? (
                    <i className="fa-solid fa-circle-notch fa-spin text-[10px]" />
                  ) : (
                    <i className="fa-solid fa-trash-can text-[10px]"></i>
                  )}
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-50 tracking-tight leading-tight mb-3">
          {post.title}
        </h1>

        {/* Short description */}
        {post.shortDescription && (
          <p className="text-base text-zinc-400 leading-relaxed mb-4">
            {post.shortDescription}
          </p>
        )}

        {/* Looking for contributors badge */}
        {post.lookingForContributors && (
          <div className="inline-flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <i className="fa-solid fa-handshake text-[11px]"></i>
            Looking for Contributors
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-zinc-800 mb-8" />

        {/* Rendered Markdown */}
        {renderedMarkdown && (
          <div
            className="prose-content text-zinc-300 leading-relaxed text-[15px] mb-10 select-text"
            dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
          />
        )}

        {/* Tech stack badges */}
        {post.techStack && post.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.techStack.map((tech, idx) => {
              const iconClass = getTechIconClass(tech);
              return (
                <span
                  key={idx}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-emerald-500/30 hover:text-zinc-200 hover:bg-emerald-500/5 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 capitalize transition-all"
                >
                  {iconClass && <i className={`${iconClass} text-xs`}></i>}
                  {tech}
                </span>
              );
            })}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center gap-6 py-5 border-t border-zinc-800 text-zinc-500 mb-12">
          <Like
            initialLiked={post.isLiked}
            initialLikeCount={post.likeCount || 0}
            onToggle={() => executeLikeMutation(post._id)}
          />
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <i className="fa-regular fa-comment text-sm"></i>
            <span>{post.commentCount || 0}</span>
            <span className="hidden sm:inline">Comments</span>
          </div>
        </div>

        {/* ── Comments ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-zinc-800 overflow-hidden"
          style={{ background: "var(--surface)" }}>
          <Comment postId={post._id} />
        </div>

      </div>
    </div>
  );
}
