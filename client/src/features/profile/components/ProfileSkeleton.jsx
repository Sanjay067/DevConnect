import React from "react";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen animate-pulse pb-20" style={{ background: "var(--bg)" }}>
      <div className="h-48 w-full bg-zinc-800/50" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-16">
        <div className="flex flex-col gap-4">
          <div className="w-32 h-32 rounded-full border-4 border-zinc-950 bg-zinc-800" />
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="h-8 w-48 bg-zinc-800 rounded-lg" />
              <div className="h-4 w-32 bg-zinc-800 rounded" />
            </div>
            <div className="flex gap-3">
              <div className="w-24 h-10 bg-zinc-800 rounded-lg" />
              <div className="w-24 h-10 bg-zinc-800 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
