import React from "react";
import Link from "next/link";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";

export function ChatUserProfileCardSkeleton() {
  return (
    <div className="w-full max-w-sm mx-auto my-6 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 text-center flex flex-col items-center shadow-xl animate-pulse">
      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-zinc-800 mb-3" />
      <div className="h-5 w-32 rounded bg-zinc-800 mb-2" />
      <div className="h-3 w-24 rounded bg-zinc-800 mb-3" />
      <div className="h-3.5 w-48 rounded bg-zinc-800 mb-4" />
      <div className="h-8 w-28 rounded-xl bg-zinc-800" />
    </div>
  );
}

export default function ChatUserProfileCard({ peer, profile, isLoading }) {
  if (isLoading && !peer) {
    return <ChatUserProfileCardSkeleton />;
  }

  if (!peer) return null;

  const headline = profile?.headline || peer.headline || "Developer at dev.connect";

  return (
    <div className="w-full max-w-sm mx-auto my-6 p-6 rounded-2xl border border-zinc-800/90 bg-zinc-900/40 text-center flex flex-col items-center shadow-xl transition-all hover:border-zinc-700/60">
      {/* Large Avatar */}
      <Link href={`/profile/${peer._id}`} className="group relative mb-3">
        <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-zinc-700 ring-4 ring-emerald-500/20 group-hover:scale-105 group-hover:border-emerald-500 transition-all duration-300 shadow-xl">
          <img
            src={resolveProfilePicture(peer.profilePicture)}
            alt={peer.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Name & Username */}
      <Link href={`/profile/${peer._id}`} className="group">
        <h3 className="text-base sm:text-lg font-extrabold text-zinc-100 group-hover:text-emerald-400 transition-colors tracking-tight">
          {peer.name}
        </h3>
      </Link>
      <p className="text-xs font-mono text-zinc-500 mb-2">@{peer.username}</p>

      {/* Headline */}
      {headline && (
        <p className="text-xs text-zinc-400 font-medium max-w-xs mb-3 line-clamp-2 leading-relaxed">
          {headline}
        </p>
      )}

      {/* Connection Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold mb-4">
        <i className="fa-solid fa-user-check text-[10px]" />
        <span>Connected on dev.connect</span>
      </div>

      {/* View Profile Action Button */}
      <Link
        href={`/profile/${peer._id}`}
        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 hover:text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 group"
      >
        <i className="fa-solid fa-user text-[11px] text-emerald-400 group-hover:scale-110 transition-transform" />
        <span>View Profile</span>
      </Link>
    </div>
  );
}
