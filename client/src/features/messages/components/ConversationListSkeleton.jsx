import React from "react";

export default function ConversationListSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800/50 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3 rounded-md bg-zinc-800" style={{ width: `${[60, 80, 55, 70, 65][i]}%` }} />
            <div className="h-2.5 rounded bg-zinc-800/70" style={{ width: `${[80, 65, 90, 50, 75][i]}%` }} />
          </div>
        </div>
      ))}
    </>
  );
}
