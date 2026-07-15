import React from "react";

export default function EmptyState({ onClear }) {
  return (
    <div className="col-span-full text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
      <i className="fa-solid fa-user-slash text-4xl text-zinc-700 mb-4" aria-hidden="true"></i>
      <h3 className="text-sm font-semibold text-zinc-400">No developers matched</h3>
      <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
        Try searching for different names, usernames, or technology skills.
      </p>
      <button
        onClick={onClear}
        className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
      >
        Clear search filters
      </button>
    </div>
  );
}
