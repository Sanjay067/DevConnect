import React from "react";
import ConversationItem from "./ConversationItem";
import ConversationListSkeleton from "./ConversationListSkeleton";

export default function ConversationList({
  conversations = [],
  selectedPeerId,
  loadingConversations,
  onSelectPeer,
  showMobilePanel = true,
}) {
  return (
    <div
      className={`h-full border-r border-zinc-800 flex-col shrink-0 ${
        showMobilePanel ? "flex w-full md:w-[280px]" : "hidden md:flex md:w-[280px]"
      }`}
    >
      <div className="px-5 py-4 border-b border-zinc-800 shrink-0">
        <h2 className="text-sm font-bold text-zinc-100">Messages</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loadingConversations ? (
          <ConversationListSkeleton />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <img src="/messages-sample2.png" alt="No Chats Yet" className="w-full h-full object-cover" />
          </div>
        ) : (
          conversations.map(({ peer, lastMessage, unreadCount }) => (
            <ConversationItem
              key={peer._id}
              peer={peer}
              lastMessage={lastMessage}
              unreadCount={unreadCount}
              isActive={selectedPeerId === String(peer._id)}
              onClick={() => onSelectPeer(String(peer._id))}
            />
          ))
        )}
      </div>
    </div>
  );
}
