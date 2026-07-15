import React from "react";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";

export default function ConversationItem({ peer, lastMessage, isActive, onClick, unreadCount }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 border-b border-zinc-800/50 transition-all duration-150 cursor-pointer group ${
        isActive
          ? "bg-emerald-500/10 border-l-2 border-l-emerald-500"
          : "hover:bg-zinc-800/50 border-l-2 border-l-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-700 shrink-0">
          <img
            src={resolveProfilePicture(peer.profilePicture)}
            alt={peer.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-semibold truncate ${isActive ? "text-emerald-400" : "text-zinc-200 group-hover:text-zinc-100"}`}>
            {peer.name}
          </p>
          <p className="text-[11px] text-zinc-500 truncate mt-0.5">
            {lastMessage?.body || "Start a conversation"}
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            {unreadCount}
          </div>
        )}
      </div>
    </button>
  );
}
