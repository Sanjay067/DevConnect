import React from "react";
import { useRouter } from "next/navigation";

export default function NoConversationSelected() {
  const router = useRouter();
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 select-none">
      {/* Illustration */}
      <img
        src="/messages-sample.png"
        alt="Two developers exchanging ideas"
        className="rounded-xl w-72 opacity-90 pointer-events-none"
        draggable={false}
      />

      {/* Text content */}
      <div className="text-center max-w-xs">
        <h2 className="text-lg font-bold text-zinc-100 mb-2">No conversation selected</h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Pick a developer from the list to start a conversation, or discover new developers to collaborate with.
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => router.push("/network")}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer"
      >
        <i className="fa-solid fa-users text-xs"></i>
        Discover Developers
        <i className="fa-solid fa-arrow-right text-xs"></i>
      </button>

      <p className="flex items-center gap-1.5 text-[11px] text-zinc-600">
        <i className="fa-solid fa-shield-halved text-[10px]"></i>
        Follow developers to connect and start chatting
      </p>
    </div>
  );
}
