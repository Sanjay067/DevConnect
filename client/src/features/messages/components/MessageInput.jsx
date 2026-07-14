import React, { useRef, useEffect } from "react";

export default function MessageInput({ draft, setDraft, onSend, isPending }) {
  const textareaRef = useRef(null);

  // Auto-grow textarea height on content change
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [draft]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onSend();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const body = draft.trim();
      if (body && !isPending) {
        onSend();
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-zinc-800 p-4 flex gap-3 shrink-0 items-end"
      style={{ background: "var(--bg)" }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message..."
        className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-600 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition-all resize-none max-h-[120px] overflow-y-auto scrollbar-thin py-3"
        style={{ height: "auto" }}
      />
      <button
        type="submit"
        disabled={isPending || !draft.trim()}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer h-10 shrink-0"
      >
        <i className="fa-solid fa-paper-plane text-xs"></i>
        Send
      </button>
    </form>
  );
}
