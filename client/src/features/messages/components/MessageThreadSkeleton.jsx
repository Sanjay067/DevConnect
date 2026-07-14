import React from "react";

const BUBBLE_SHAPES = [
  { mine: false, w: "55%" },
  { mine: true, w: "42%" },
  { mine: true, w: "28%" },
  { mine: false, w: "65%" },
  { mine: false, w: "38%" },
  { mine: true, w: "50%" },
  { mine: false, w: "30%" },
  { mine: true, w: "60%" },
];

export default function MessageThreadSkeleton() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-800 shrink-0 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0" />
        <div className="space-y-2">
          <div className="h-3 w-28 rounded-md bg-zinc-800" />
          <div className="h-2 w-16 rounded bg-zinc-800/70" />
        </div>
      </div>

      {/* Bubbles */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {/* Date separator */}
        <div className="flex items-center gap-3 my-3 animate-pulse">
          <div className="flex-1 h-px bg-zinc-800" />
          <div className="h-5 w-16 rounded-full bg-zinc-800" />
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {BUBBLE_SHAPES.map((b, i) => (
          <div
            key={i}
            className={`flex ${b.mine ? "justify-end" : "justify-start"} animate-pulse`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div
              className={`h-10 rounded-2xl ${
                b.mine ? "bg-emerald-500/20 rounded-br-sm" : "bg-zinc-800 rounded-bl-sm"
              }`}
              style={{ width: b.w, maxWidth: "72%" }}
            />
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="border-t border-zinc-800 p-4 flex gap-3 shrink-0 animate-pulse" style={{ background: "var(--bg)" }}>
        <div className="flex-1 h-10 rounded-xl bg-zinc-800" />
        <div className="w-20 h-10 rounded-xl bg-zinc-800" />
      </div>
    </>
  );
}
