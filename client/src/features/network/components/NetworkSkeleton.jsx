import React from "react";

export default function NetworkSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 flex flex-col justify-between min-h-[350px] animate-pulse"
          >
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-zinc-800 shrink-0" />
                <div className="space-y-2 flex-1 min-w-0 pt-1">
                  <div className="h-4 w-32 rounded-md bg-zinc-800" />
                  <div className="h-3 w-20 rounded-md bg-zinc-800" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-zinc-800" />
                <div className="h-3 w-4/5 rounded bg-zinc-800" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[52, 64, 48].map((w, j) => (
                  <div key={j} className="h-6 rounded-md bg-zinc-800" style={{ width: `${w}px` }} />
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-800 mt-6 space-y-4">
              <div className="h-3 w-24 rounded bg-zinc-800" />
              <div className="flex gap-2.5">
                <div className="flex-1 h-9 rounded-xl bg-zinc-800" />
                <div className="flex-1 h-9 rounded-xl bg-zinc-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
