import React, { useState } from "react";
import { formatBubbleTime } from "../utils/formatBubbleTime";

export default function MessageBubble({ msg, isMine, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  const canDelete = isMine && !msg.isOptimistic && (Date.now() - new Date(msg.createdAt).getTime() < 15 * 60 * 1000);

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} group relative mb-1`}>
      {canDelete && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center mr-2 self-center relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="w-7 h-7 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 flex items-center justify-center cursor-pointer transition-colors"
          >
            <i className="fa-solid fa-ellipsis-vertical text-xs"></i>
          </button>
          
          {showMenu && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setShowMenu(false)}
              />
              {/* Dropdown Options */}
              <div className="absolute right-0 bottom-8 z-50 min-w-[110px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 cursor-pointer transition-all"
                >
                  <i className="fa-regular fa-trash-can"></i>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div
        className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isMine
            ? "bg-emerald-500 text-zinc-950 font-medium rounded-br-sm"
            : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
        }`}
      >
        <div>{msg.body}</div>
        <div className="flex items-center justify-end gap-2 mt-1 select-none">
          <span
            className={`text-[9px] tracking-tight ${
              isMine ? "text-zinc-950/65 font-bold" : "text-zinc-500"
            }`}
          >
            {formatBubbleTime(msg.createdAt)}
          </span>
          {msg.isOptimistic && (
            <div className="w-8 h-1 bg-zinc-950/15 rounded-full overflow-hidden relative shrink-0">
              <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-zinc-950/45 rounded-full animate-slide-loader"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
