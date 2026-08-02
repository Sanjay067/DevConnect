import React, { Fragment } from "react";
import MessageBubble from "./MessageBubble";
import MessageThreadSkeleton from "./MessageThreadSkeleton";
import ChatUserProfileCard from "./ChatUserProfileCard";
import { getDayKey } from "../utils/getDayKey";
import { formatDateSeparator } from "../utils/formatDateSeparator";

export default function MessageList({
  messages = [],
  myId,
  selectedPeer,
  publicProfile,
  loadingPublicProfile,
  loadingMessages,
  messagesError,
  messagesEndRef,
  onDeleteMessage,
}) {
  if (loadingMessages) {
    return <MessageThreadSkeleton />;
  }

  if (messagesError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center">
          <i className="fa-solid fa-triangle-exclamation text-zinc-500 text-xl" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-300 mb-1">Could not load messages</p>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
            Something went wrong. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 flex flex-col">
      {/* Top Profile Header Card (Instagram / WhatsApp style) */}
      {(selectedPeer || loadingPublicProfile) && (
        <ChatUserProfileCard
          peer={selectedPeer}
          profile={publicProfile}
          isLoading={loadingPublicProfile}
        />
      )}

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center pb-8 gap-2 text-center select-none">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg text-emerald-400">
            👋
          </div>
          <p className="text-xs font-semibold text-zinc-400">Say hello!</p>
          <p className="text-[11px] text-zinc-600 max-w-[220px]">
            Send a message to start chatting with {selectedPeer?.name || "this developer"}.
          </p>
        </div>
      ) : (
        messages.map((msg, idx) => {
          const isMine = String(msg.senderId) === myId;
          const dayKey = getDayKey(msg.createdAt);
          const prevDayKey = idx > 0 ? getDayKey(messages[idx - 1].createdAt) : null;
          const showSeparator = dayKey !== prevDayKey;

          return (
            <Fragment key={msg._id}>
              {showSeparator && (
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 shrink-0">
                    {formatDateSeparator(msg.createdAt)}
                  </span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>
              )}
              <MessageBubble msg={msg} isMine={isMine} onDelete={() => onDeleteMessage(msg._id)} />
            </Fragment>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
