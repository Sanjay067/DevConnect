"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
} from "@/services/messageService";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";
import Loader from "@/shared/components/Loader";

// ── Format Message Timestamp ────────────────────────────────────────────────
const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const today = new Date();
  const isToday = d.getDate() === today.getDate() &&
                  d.getMonth() === today.getMonth() &&
                  d.getFullYear() === today.getFullYear();
  
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return timeStr;
  
  const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${dateStr}, ${timeStr}`;
};

// ── Illustrated empty state ─────────────────────────────────────────────────
function NoConversationSelected() {
  const router = useRouter();
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 select-none">
      {/* Illustration */}
      <img
        src="/messages-sample.png"
        alt="Two developers exchanging ideas"
        className="rounded-xl w-72 opacity-90 pointer-events-none"
        draggable={false}
      />

      {/* Text content */}
      <div className="text-center max-w-xs">
        <h2 className="text-lg font-bold text-zinc-100 mb-2">No conversation selected</h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Pick a developer from the list to start a conversation, or discover new developers to collaborate with.
        </p>
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => router.push("/network")}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer"
      >
        <i className="fa-solid fa-users text-xs"></i>
        Discover Developers
        <i className="fa-solid fa-arrow-right text-xs"></i>
      </button>

      <p className="flex items-center gap-1.5 text-[11px] text-zinc-600">
        <i className="fa-solid fa-shield-halved text-[10px]"></i>
        Follow developers to connect and start chatting
      </p>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
function MessagesPage() {
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.user);
  const myId = String(currentUser?._id || "");
  const [selectedPeerId, setSelectedPeerId] = useState(null);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const peer = params.get("peer");
      if (peer) {
        setSelectedPeerId(peer);
      }
    }
  }, []);

  const { data: conversationsData, isLoading: loadingConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations().then((res) => res.data),
  });

  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ["messages", selectedPeerId],
    queryFn: () => getConversationMessages(selectedPeerId).then((res) => res.data),
    enabled: !!selectedPeerId,
    refetchInterval: selectedPeerId ? 5000 : false,
  });

  const sendMutation = useMutation({
    mutationFn: ({ peerId, body }) => sendMessage(peerId, body),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedPeerId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const prevPeerIdRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    const messagesList = messagesData?.messages || [];
    const hasPeerChanged = selectedPeerId !== prevPeerIdRef.current;
    const hasNewMessages = messagesList.length > prevMessagesLengthRef.current;

    if (hasPeerChanged || hasNewMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevPeerIdRef.current = selectedPeerId;
    prevMessagesLengthRef.current = messagesList.length;
  }, [messagesData?.messages, selectedPeerId]);

  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];

  const selectedPeer = conversations.find(
    ({ peer }) => String(peer._id) === selectedPeerId
  )?.peer;

  const handleSend = (e) => {
    e.preventDefault();
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
        {/* ── Left panel: conversation list ── */}
        <div className={`h-full border-r border-zinc-800 flex-col shrink-0 ${
          selectedPeerId ? "hidden md:flex md:w-[280px]" : "flex w-full md:w-[280px]"
        }`}>
          <div className="px-5 py-4 border-b border-zinc-800 shrink-0">
            <h2 className="text-sm font-bold text-zinc-100">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConversations && (
              <div className="flex items-center justify-center py-8">
                <Loader />
              </div>
            )}

            {!loadingConversations && conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <img src="/messages-sample2.png" alt="No Chats Yet" className="w-full h-full object-cover" />
              </div>
            )}

            {conversations.map(({ peer, lastMessage }) => {
              const isActive = selectedPeerId === String(peer._id);
              return (
                <button
                  key={peer._id}
                  type="button"
                  onClick={() => setSelectedPeerId(String(peer._id))}
                  className={`w-full text-left px-4 py-3.5 border-b border-zinc-800/50 transition-all duration-150 cursor-pointer group ${isActive
                    ? "bg-emerald-500/10 border-l-2 border-l-emerald-500"
                    : "hover:bg-zinc-800/50 border-l-2 border-l-transparent"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-700 shrink-0">
                      <img
                        src={resolveProfilePicture(peer.profilePicture)}
                        alt={peer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold truncate ${isActive ? "text-emerald-400" : "text-zinc-200 group-hover:text-zinc-100"}`}>
                        {peer.name}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {lastMessage?.body || "Start a conversation"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right panel: message thread ── */}
        <div className={`h-full flex-col min-w-0 ${
          selectedPeerId ? "flex flex-1" : "hidden md:flex md:flex-1"
        }`}>
          {!selectedPeerId ? (
            <NoConversationSelected />
          ) : (
            <>
              {/* Chat header */}
              {selectedPeer && (
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-800 shrink-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.history.replaceState(null, "", "/messages");
                      }
                      setSelectedPeerId(null);
                    }}
                    className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 cursor-pointer transition-colors"
                  >
                    <i className="fa-solid fa-arrow-left text-xs" />
                  </button>

                  <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700">
                    <img
                      src={resolveProfilePicture(selectedPeer.profilePicture)}
                      alt={selectedPeer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{selectedPeer.name}</p>
                    <p className="text-[10px] text-zinc-500">@{selectedPeer.username}</p>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {loadingMessages && (
                  <div className="flex justify-center py-4">
                    <Loader />
                  </div>
                )}
                {messages.map((msg) => {
                  const isMine = String(msg.senderId) === myId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isMine
                          ? "bg-emerald-500 text-zinc-950 font-medium rounded-br-sm"
                          : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
                          }`}
                      >
                        <div>{msg.body}</div>
                        <span className={`text-[9px] mt-1 block tracking-tight ${
                          isMine ? "text-zinc-950/65 font-bold text-right" : "text-zinc-500 text-left"
                        }`}>
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <form
                onSubmit={handleSend}
                className="border-t border-zinc-800 p-4 flex gap-3 shrink-0"
                style={{ background: "var(--bg)" }}
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-600 px-4 py-2.5 text-sm outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 transition-all"
                />
                <button
                  type="submit"
                  disabled={sendMutation.isPending || !draft.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
