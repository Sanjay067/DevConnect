import React from "react";
import PostCard from "@/features/feed/components/PostCard";

export default function AllShowcases({
  feedProjects,
  featuredProjects,
  isOwnProfile,
  postsLoading,
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <i className="fa-solid fa-code-branch text-emerald-500 text-sm" aria-hidden="true"></i>
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">All Showcases</h2>
      </div>

      <div className="space-y-4">
        {postsLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
          </div>
        ) : feedProjects.length > 0 ? (
          feedProjects.map((post) => (
            <PostCard key={post._id} post={post} showMenu={isOwnProfile} />
          ))
        ) : featuredProjects.length > 0 ? (
          <p className="text-zinc-500 text-xs text-center py-8">All other showcases are featured above.</p>
        ) : (
          <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
            <p className="text-zinc-500 text-xs">No other showcases published.</p>
          </div>
        )}
      </div>
    </section>
  );
}
