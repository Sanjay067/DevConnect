"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";

export default function CreatePostCard() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push("/posts/create");
  };

  const lineNumbers = useMemo(() => [1, 2, 3, 4, 5], []);

  return (
    <div className="w-full max-w-2xl mx-auto my-5 shrink-0">
      <div
        onClick={handleNavigate}
        className="w-full rounded-2xl p-5 border border-zinc-800 shadow-2xl transition-all duration-300 hover:border-zinc-700/80 cursor-pointer group"
        style={{ background: "#0c0c0e" }}
      >
        {/* Header title */}
        <div className="flex items-center justify-between mb-3.5">
          <p className="text-xs font-mono font-medium text-zinc-400 flex items-center gap-2 group-hover:text-zinc-200 transition-colors">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Share your build, idea, or learning...
          </p>
        </div>

        {/* IDE-style Code Editor Preview Box */}
        <div className="relative border border-zinc-800/90 bg-zinc-950/80 rounded-xl p-3.5 font-mono flex items-stretch transition-all group-hover:border-zinc-700/70">
          {/* Top Right Badges */}
          <div className="absolute top-2.5 right-3 z-10 flex items-center gap-2 select-none">
            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md flex items-center gap-1">
              <i className="fa-solid fa-code text-[9px] text-emerald-500" />
              Markdown
            </span>
          </div>

          {/* Line Numbers Gutter */}
          <div className="flex flex-col text-right select-none text-zinc-650 text-[11px] leading-relaxed pr-3 border-r border-zinc-800/80 mr-3 min-w-[22px] font-mono">
            {lineNumbers.map((num) => (
              <span key={num} className="text-zinc-650 font-semibold">
                {num}
              </span>
            ))}
          </div>

          {/* Editor Placeholder Text */}
          <div className="flex-1 text-zinc-500 text-xs leading-relaxed font-mono select-none space-y-1">
            <p>
              Just shipped a new feature <span className="text-amber-400">✨</span>
            </p>
            <p>
              Used <span className="text-emerald-400 font-semibold">Redis</span> +{" "}
              <span className="text-emerald-400 font-semibold">BullMQ</span> for background jobs and it&apos;s been a game changer.
            </p>
            <p className="pt-2 text-zinc-600">Would love your feedback!</p>
          </div>
        </div>

        {/* Bottom Action Bar & Post Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 mt-3.5 border-t border-zinc-800/70">
          {/* Left Action Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              type="button"
              onClick={handleNavigate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 text-[11px] font-bold transition-all cursor-pointer shrink-0"
            >
              <i className="fa-solid fa-code text-emerald-500 text-xs" />
              Code
            </button>
            <button
              type="button"
              onClick={handleNavigate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 text-[11px] font-bold transition-all cursor-pointer shrink-0"
            >
              <i className="fa-regular fa-image text-emerald-500 text-xs" />
              Image
            </button>
            <button
              type="button"
              onClick={handleNavigate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 text-[11px] font-bold transition-all cursor-pointer shrink-0"
            >
              <i className="fa-solid fa-link text-emerald-500 text-xs" />
              Link
            </button>
            <button
              type="button"
              onClick={handleNavigate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 text-[11px] font-bold transition-all cursor-pointer shrink-0"
            >
              <i className="fa-solid fa-tag text-emerald-500 text-xs" />
              Tech Badge
            </button>
          </div>

          {/* Right Post Button */}
          <button
            type="button"
            onClick={handleNavigate}
            className="ml-auto px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0"
          >
            <i className="fa-solid fa-paper-plane text-xs" />
            <span>Post</span>
          </button>
        </div>
      </div>
    </div>
  );
}
