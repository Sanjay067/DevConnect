"use client";

import FeedWrapper from "@/features/feed/components/FeedWrapper";
import { useFeed } from '../../../features/feed/hooks/useFeed';

// ── PostCard-shaped skeleton ─────────────────────────────────────────────────
function PostCardSkeleton() {
    return (
        <div className="w-full max-w-2xl mx-auto my-5 rounded-2xl p-6 border border-zinc-800 animate-pulse"
            style={{ background: "var(--surface)" }}>

            {/* Header: avatar + name + button */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-zinc-800 shrink-0" />
                    <div className="space-y-2">
                        <div className="h-3.5 w-28 rounded bg-zinc-800" />
                        <div className="h-2.5 w-20 rounded bg-zinc-800" />
                    </div>
                </div>
                <div className="h-7 w-16 rounded-lg bg-zinc-800" />
            </div>

            {/* Title */}
            <div className="h-6 w-2/3 rounded-lg bg-zinc-800 mb-2" />
            {/* Description */}
            <div className="h-4 w-full rounded bg-zinc-800 mb-1.5" />
            <div className="h-4 w-4/5 rounded bg-zinc-800 mb-5" />

            {/* Image block */}
            <div className="h-52 w-full rounded-xl bg-zinc-800 mb-4" />

            {/* View more + links row */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-16 rounded bg-zinc-800" />
                <div className="flex gap-2">
                    <div className="h-7 w-20 rounded-lg bg-zinc-800" />
                    <div className="h-7 w-24 rounded-lg bg-zinc-800" />
                </div>
            </div>

            {/* Tech badges */}
            <div className="flex gap-2 mb-5">
                {[60, 72, 52, 80, 64].map((w, i) => (
                    <div key={i} className={`h-7 rounded-lg bg-zinc-800`} style={{ width: `${w}px` }} />
                ))}
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-5 pt-4 border-t border-zinc-800/50">
                <div className="h-3 w-12 rounded bg-zinc-800" />
                <div className="h-3 w-16 rounded bg-zinc-800" />
            </div>
        </div>
    );
}

function FeedSkeleton() {
    return (
        <div className="max-w-7xl mx-auto flex gap-8 px-4 justify-center">
            <div className="flex-1 min-w-0">
                {/* CreatePostCard placeholder */}
                <div className="w-full max-w-2xl mx-auto my-5 rounded-2xl p-4 border border-zinc-800 animate-pulse"
                    style={{ background: "var(--surface)" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
                        <div className="flex-1 h-10 rounded-xl bg-zinc-800" />
                    </div>
                </div>
                {/* 3 post card skeletons */}
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
            </div>
        </div>
    );
}

function Feed() {
    const { data: feed, isLoading, isError, error } = useFeed();

    if (isLoading) {
        return (
            <main className="min-h-screen py-5" style={{ background: "var(--bg)" }}>
                <FeedSkeleton />
            </main>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
                <i className="fa-solid fa-triangle-exclamation text-2xl text-zinc-600"></i>
                <p className="text-zinc-500 text-sm">Failed to load feed: {error.message}</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-5">
            <FeedWrapper feed={feed} />
        </main>
    );
}

export default Feed;