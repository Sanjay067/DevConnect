"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
} from "@/services/messageService";
import { resolveProfilePicture } from "@/shared/lib/imageHelpers";
import Loader from "@/shared/components/Loader";

function MessagesPage() {
  const queryClient = useQueryClient();
  const currentUser = useSelector((state) => state.auth.user);
  const myId = String(currentUser?._id || "");
  const [selectedPeerId, setSelectedPeerId] = useState(null);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef(null);

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

  const handleSend = (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !selectedPeerId) return;
    sendMutation.mutate({ peerId: selectedPeerId, body });
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 h-[calc(100vh-64px)]">
      <div className="flex h-full bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="w-1/3 border-r border-gray-100 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 font-bold text-gray-900">
            Messages
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConversations && (
              <div className="p-4">
                <Loader />
              </div>
            )}
            {!loadingConversations && conversations.length === 0 && (
              <p className="p-4 text-xs text-gray-500">
                Follow someone in Network to start messaging.
              </p>
            )}
            {conversations.map(({ peer, lastMessage }) => (
              <button
                key={peer._id}
                type="button"
                onClick={() => setSelectedPeerId(String(peer._id))}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  selectedPeerId === String(peer._id) ? "bg-blue-50/50" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
                    <img
                      src={resolveProfilePicture(peer.profilePicture)}
                      alt={peer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{peer.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{lastMessage?.body}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedPeerId ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages && <Loader />}
                {messages.map((msg) => {
                  const isMine = String(msg.senderId) === myId;
                  return (
                  <div
                    key={msg._id}
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      isMine
                        ? "bg-blue-600 text-white ml-auto"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.body}
                  </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="border-t border-gray-100 p-3 flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={sendMutation.isPending || !draft.trim()}
                  className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
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
