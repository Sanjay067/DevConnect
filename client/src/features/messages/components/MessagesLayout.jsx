import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import ConversationList from "./ConversationList";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import NoConversationSelected from "./NoConversationSelected";

import { useConversations } from "../hooks/useConversations";
import { useMessages } from "../hooks/useMessages";
import { useScrollToBottom } from "../hooks/useScrollToBottom";
import { getPublicUserProfile } from "@/services/userService";

export default function MessagesLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useSelector((state) => state.auth.user);
  const myId = String(currentUser?._id || "");
  const queryClient = useQueryClient();

  const selectedPeerId =
    searchParams.get("peer") ||
    searchParams.get("user") ||
    searchParams.get("userId");
  const [draft, setDraft] = useState("");

  // Invalidate conversations and unread count to flush read-states immediately
  useEffect(() => {
    if (selectedPeerId) {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    }
  }, [selectedPeerId, queryClient]);

  // Lock outer body scroll on messages view to enforce internal panel scrolling
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const { data: conversationsData, isLoading: loadingConversations } = useConversations();
  const conversations = conversationsData?.conversations || [];

  const peerInConversations = useMemo(() => {
    return conversations.find(
      ({ peer }) => String(peer._id) === selectedPeerId
    )?.peer;
  }, [conversations, selectedPeerId]);

  const isNewConversation = !!(selectedPeerId && !peerInConversations);

  const { data: publicProfileWrapper, isLoading: loadingPublicProfile } = useQuery({
    queryKey: ["publicProfile", selectedPeerId],
    queryFn: () => getPublicUserProfile(selectedPeerId).then((res) => res.data),
    enabled: !!selectedPeerId,
  });

  const publicUser = publicProfileWrapper?.user;

  const selectedPeer = peerInConversations || publicUser;

  const displayConversations = useMemo(() => {
    if (isNewConversation && publicUser) {
      const tempConv = {
        peer: publicUser,
        lastMessage: { body: "Start a conversation" },
        unreadCount: 0,
      };
      return [tempConv, ...conversations];
    }
    return conversations;
  }, [conversations, isNewConversation, publicUser]);

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
    <div
      className={`w-full transition-all duration-200 ${
        selectedPeerId
          ? "fixed inset-0 z-50 h-[100dvh] bg-zinc-950 p-0 md:static md:z-auto md:max-w-6xl md:mx-auto md:px-4 md:py-0 md:h-[calc(100vh-105px)] md:bg-transparent"
          : "max-w-6xl mx-auto px-3 py-2 h-[calc(100dvh-125px)] md:px-4 md:py-0 md:h-[calc(100vh-105px)]"
      }`}
    >
      <div
        className={`flex h-full overflow-hidden shadow-2xl border-zinc-800 ${
          selectedPeerId
            ? "rounded-none border-0 md:rounded-2xl md:border"
            : "rounded-2xl border"
        }`}
        style={{ background: "var(--surface)" }}
      >
        {/* Left Panel: Conversations list */}
        <ConversationList
          conversations={displayConversations}
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
              <ChatHeader
                selectedPeer={selectedPeer}
                isLoading={loadingPublicProfile}
                onBack={handleBack}
              />

              <MessageList
                messages={messages}
                myId={myId}
                selectedPeer={selectedPeer}
                publicProfile={publicProfileWrapper?.profile}
                loadingPublicProfile={loadingPublicProfile}
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
