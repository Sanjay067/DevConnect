import React from "react";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";

export default function ChatHeader({ selectedPeer, onBack }) {
  if (!selectedPeer) return null;

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-800 shrink-0">
      {/* Mobile Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 cursor-pointer transition-colors"
      >
        <i className="fa-solid fa-arrow-left text-xs" />
      </button>

      <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700">
        <img
          src={resolveProfilePicture(selectedPeer.profilePicture)}
          alt={selectedPeer.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-100">{selectedPeer.name}</p>
        <p className="text-[10px] text-zinc-500">@{selectedPeer.username}</p>
      </div>
    </div>
  );
}
