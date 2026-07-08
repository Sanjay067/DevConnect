"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getUserPosts } from "@/services/postService";
import PostCard from "@/features/feed/components/PostCard";
import Loader from "@/shared/components/Loader";

export default function MyPostsPage() {
    const { data: postsData, isLoading, isError, error } = useQuery({
        queryKey: ["myPosts"],
        queryFn: () => getUserPosts().then((res) => res.data),
    });

    const posts = postsData?.posts || [];

    if (isLoading) {
        return (
            <main className="min-h-screen py-10" style={{ background: "var(--bg)" }}>
                <div className="flex justify-center py-20">
                    <Loader />
                </div>
            </main>
        );
    }

    if (isError) {
        return (
            <main className="min-h-screen py-10 flex flex-col items-center justify-center gap-4" style={{ background: "var(--bg)" }}>
                <i className="fa-solid fa-triangle-exclamation text-3xl text-zinc-600"></i>
                <p className="text-zinc-500 text-sm">Failed to load posts: {error?.message}</p>
                <Link href="/feed" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                    ← Back to Feed
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen py-8 px-4" style={{ background: "var(--bg)" }}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-zinc-50 tracking-tight">My Projects</h1>
                        <p className="text-sm text-zinc-500 mt-1">Manage and edit your showcased projects</p>
                    </div>
                    <Link
                        href="/posts/create"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
                    >
                        <i className="fa-solid fa-plus text-xs"></i>
                        New Project
                    </Link>
                </div>

                {/* Posts List */}
                <div className="space-y-6">
                    {posts.length === 0 ? (
                        <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
                            <i className="fa-solid fa-code text-4xl text-zinc-700 mb-4"></i>
                            <h3 className="text-lg font-semibold text-zinc-300">No projects yet</h3>
                            <p className="text-sm text-zinc-500 max-w-xs mx-auto mt-2 mb-6">
                                Share your first project with the devConnect developer network to showcase your stack and connect.
                            </p>
                            <Link
                                href="/posts/create"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold transition-all"
                            >
                                Show off a Project
                            </Link>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <PostCard key={post._id} post={{ ...post, isAuthor: true }} />
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
