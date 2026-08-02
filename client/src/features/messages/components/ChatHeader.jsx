import React from "react";
import Link from "next/link";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";

export default function ChatHeader({ selectedPeer, isLoading, onBack }) {
  if (isLoading && !selectedPeer) {
    return (
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 shrink-0 animate-pulse">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 shrink-0"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
          </button>
          <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0" />
          <div className="space-y-1.5 min-w-0">
            <div className="h-3.5 w-28 rounded bg-zinc-800" />
            <div className="h-2.5 w-20 rounded bg-zinc-800" />
          </div>
        </div>
        <div className="hidden sm:block h-7 w-24 rounded-xl bg-zinc-800" />
      </div>
    );
  }

  if (!selectedPeer) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 cursor-pointer transition-colors shrink-0"
        >
          <i className="fa-solid fa-arrow-left text-xs" />
        </button>

        {/* Profile Link Header */}
        <Link
          href={`/profile/${selectedPeer._id}`}
          className="flex items-center gap-3 min-w-0 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-700 ring-2 ring-emerald-500/10 group-hover:border-emerald-500 transition-colors shrink-0">
            <img
              src={resolveProfilePicture(selectedPeer.profilePicture)}
              alt={selectedPeer.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
              {selectedPeer.name}
            </p>
            <p className="text-[10px] font-mono text-zinc-500 truncate">
              @{selectedPeer.username}
            </p>
          </div>
        </Link>
      </div>

      {/* View Profile Action Button */}
      <Link
        href={`/profile/${selectedPeer._id}`}
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-semibold transition-all cursor-pointer shrink-0"
      >
        <i className="fa-solid fa-user text-[11px] text-emerald-400" />
        <span>View Profile</span>
      </Link>
    </div>
  );
}
