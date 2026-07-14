import { useEffect, useRef } from "react";

export const useScrollToBottom = (messagesList = [], selectedPeerId) => {
  const ref = useRef(null);
  const prevPeerIdRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    const hasPeerChanged = selectedPeerId !== prevPeerIdRef.current;
    const hasNewMessages = messagesList.length > prevMessagesLengthRef.current;

    if (hasPeerChanged || hasNewMessages) {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevPeerIdRef.current = selectedPeerId;
    prevMessagesLengthRef.current = messagesList.length;
  }, [messagesList, selectedPeerId]);

  return ref;
};
