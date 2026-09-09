import mongoose from "mongoose";
import Message from "./messages.model.js";
import Conversation from "./conversations.model.js";
import User from "../user/users.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getIO, getUserSockets } from "../../config/socket.js";

function toId(v) {
  return new mongoose.Types.ObjectId(String(v));
}

async function findOrCreateConversation(user1, user2) {
  const id1 = toId(user1);
  const id2 = toId(user2);
  let conversation = await Conversation.findOne({
    participants: { $all: [id1, id2] },
  });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [id1, id2],
    });
  }
  return conversation;
}

export const getUnreadCount = asyncHandler(async (req, res) => {
  const myId = String(req.user._id);

  const conversations = await Conversation.find({
    participants: toId(myId),
  }).select("_id");

  const conversationIds = conversations.map((c) => c._id);

  const unreadCount = await Message.countDocuments({
    conversationId: { $in: conversationIds },
    senderId: { $ne: toId(myId) },
    readAt: null,
  });

  return res.status(200).json({ count: unreadCount });
});

export const getConversations = asyncHandler(async (req, res) => {
  const myId = String(req.user._id);
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));

  const conversations = await Conversation.find({
    participants: toId(myId),
  })
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("participants", "name username profilePicture")
    .populate({
      path: "lastMessage",
      select: "body createdAt senderId readAt",
    })
    .lean();

  const formattedConversations = await Promise.all(
    conversations.map(async (c) => {
      const peer = c.participants.find(
        (p) => String(p._id) !== myId
      );

      const unreadCount = await Message.countDocuments({
        conversationId: c._id,
        senderId: { $ne: toId(myId) },
        readAt: null,
      });

      return {
        _id: c._id,
        peer,
        lastMessage: c.lastMessage,
        unreadCount,
        updatedAt: c.updatedAt,
      };
    })
  );

  const total = await Conversation.countDocuments({
    participants: toId(myId),
  });

  return res.status(200).json({
    conversations: formattedConversations,
    page,
    limit,
    total,
    hasMore: (page - 1) * limit + conversations.length < total,
  });
});

export const getConversationMessages = asyncHandler(async (req, res) => {
  const myId = String(req.user._id);
  const peerId = String(req.params.peerId);
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 40)));

  if (!mongoose.Types.ObjectId.isValid(peerId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const peerExists = await User.exists({ _id: peerId });
  if (!peerExists) return res.status(404).json({ message: "User not found" });

  const conversation = await findOrCreateConversation(myId, peerId);

  const messages = await Message.find({
    conversationId: conversation._id,
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  await Message.updateMany(
    {
      conversationId: conversation._id,
      senderId: { $ne: toId(myId) },
      readAt: null,
    },
    { $set: { readAt: new Date() } }
  );

  return res.status(200).json({ messages: messages.reverse(), page, limit });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const myId = String(req.user._id);
  const peerId = String(req.params.peerId);
  const body = String(req.body?.body || "").trim();

  if (!mongoose.Types.ObjectId.isValid(peerId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  if (!body) return res.status(400).json({ message: "Message body is required" });
  if (body.length > 2000) {
    return res.status(400).json({ message: "Message body cannot exceed 2000 characters" });
  }
  if (myId === peerId) {
    return res.status(400).json({ message: "Cannot send message to self" });
  }

  const peerExists = await User.exists({ _id: peerId });
  if (!peerExists) return res.status(404).json({ message: "User not found" });

  const conversation = await findOrCreateConversation(myId, peerId);

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: toId(myId),
    body,
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  try {
    const io = getIO();

    // Notify receiver
    const receiverSockets = getUserSockets(peerId);
    for (const socketId of receiverSockets) {
      io.to(socketId).emit("new-message", { message });
    }

    // Notify other tabs of the sender
    const senderSockets = getUserSockets(myId);
    for (const socketId of senderSockets) {
      io.to(socketId).emit("new-message", { message });
    }
  } catch (err) {
    console.error("[Socket Event] Failed to emit new-message:", err.message);
  }

  return res.status(201).json({ message });
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const myId = String(req.user._id);
  const { messageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return res.status(400).json({ message: "Invalid message id" });
  }

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  // Only the sender of the message can delete it
  if (String(message.senderId) !== myId) {
    return res.status(403).json({ message: "You are not authorized to delete this message" });
  }

  // Restrict deletion to within 15 minutes of creation
  const DELETE_LIMIT_MS = 15 * 60 * 1000;
  const timeElapsed = Date.now() - new Date(message.createdAt).getTime();
  if (timeElapsed > DELETE_LIMIT_MS) {
    return res.status(400).json({ message: "Messages can only be deleted within 15 minutes of sending" });
  }

  await Message.deleteOne({ _id: messageId });
  return res.status(200).json({ message: "Message deleted successfully" });
});
