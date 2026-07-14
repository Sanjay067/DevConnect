import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";

import ConversationList from "./ConversationList";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import NoConversationSelected from "./NoConversationSelected";

import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import { useScrollToBottom } from "../hooks/useScrollToBottom";

export default function MessagesLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useSelector((state) => state.auth.user);
  const myId = String(currentUser?._id || "");

  const selectedPeerId = searchParams.get("peer");
  const [draft, setDraft] = useState("");

  const { data: conversationsData, isLoading: loadingConversations } = useConversations();
  const conversations = conversationsData?.conversations || [];

  const selectedPeer = conversations.find(
    ({ peer }) => String(peer._id) === selectedPeerId
  )?.peer;

  const {
    messagesData,
    loadingMessages,
    messagesError,
    sendMutation,
    deleteMutation,
  } = useMessages(selectedPeerId, myId, () => setDraft(""));

  const messages = messagesData?.messages || [];
  const messagesEndRef = useScrollToBottom(messages, selectedPeerId);

  const handleSelectPeer = (peerId) => {
    router.replace(`/messages?peer=${peerId}`);
  };

  const handleBack = () => {
    router.replace("/messages");
  };

  const handleSend = () => {
    const body = draft.trim();
    if (!body || !selectedPeerId) return;
    sendMutation.mutate({ peerId: selectedPeerId, body });
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 h-[calc(100vh-140px)] md:h-[calc(100vh-80px)]">
      <div
        className="flex h-full rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl"
        style={{ background: "var(--surface)" }}
      >
        {/* Left Panel: Conversations list */}
        <ConversationList
          conversations={conversations}
          selectedPeerId={selectedPeerId}
          loadingConversations={loadingConversations}
          onSelectPeer={handleSelectPeer}
          showMobilePanel={!selectedPeerId}
        />

        {/* Right Panel: Chat thread */}
        <div
          className={`h-full flex-col min-w-0 ${selectedPeerId ? "flex flex-1" : "hidden md:flex md:flex-1"
            }`}
        >
          {!selectedPeerId ? (
            <NoConversationSelected />
          ) : (
            <>
              <ChatHeader selectedPeer={selectedPeer} onBack={handleBack} />

              <MessageList
                messages={messages}
                myId={myId}
                loadingMessages={loadingMessages}
                messagesError={messagesError}
                messagesEndRef={messagesEndRef}
                onDeleteMessage={(msgId) => deleteMutation.mutate(msgId)}
              />

              {!messagesError && (
                <MessageInput
                  draft={draft}
                  setDraft={setDraft}
                  onSend={handleSend}
                  isPending={sendMutation.isPending}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
