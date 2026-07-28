"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const socketUrl = apiUrl.replace(/\/api\/?$/, "");

    console.log(`[Socket] Connecting to: ${socketUrl}`);
    const socketInstance = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      console.log(`[Socket Connected] ID: ${socketInstance.id}`);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("[Socket Connection Error]:", err.message);
    });

    socketInstance.on("new-message", (data) => {
      console.log("[Socket Realtime] Received new message:", data.message);
      
      // Invalidate both message conversation queries (peerId is either sender or receiver)
      const peerId = data.message.senderId === user._id ? data.message.receiverId : data.message.senderId;
      
      queryClient.invalidateQueries({ queryKey: ["messages", peerId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });

    setSocket(socketInstance);

    return () => {
      console.log("[Socket] Disconnecting...");
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user, queryClient]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
