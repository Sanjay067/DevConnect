import mongoose from "mongoose";
import Message from "./messages.model.js";
import User from "../user/users.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

function toId(v) {
  return new mongoose.Types.ObjectId(String(v));
}

export const getUnreadCount = asyncHandler(async (req, res) => {
  const myId = String(req.user._id);
  const unreadChats = await Message.distinct("senderId", {
    receiverId: myId,
    readAt: null,
  });
  return res.status(200).json({ count: unreadChats.length });
});

export const getConversations = asyncHandler(async (req, res) => {
  const myId = String(req.user._id);
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
  const scanLimit = Math.min(1000, Math.max(200, page * limit * 20));
  const messages = await Message.find({
    $or: [{ senderId: myId }, { receiverId: myId }],
  })
    .sort({ createdAt: -1 })
    .limit(scanLimit)
    .populate("senderId", "name username profilePicture")
    .populate("receiverId", "name username profilePicture")
    .lean();

  const seen = new Set();
  const conversations = [];
  for (const m of messages) {
    const peer =
      String(m.senderId?._id) === myId ? m.receiverId : m.senderId;
    if (!peer?._id) continue;
    const peerId = String(peer._id);
    if (seen.has(peerId)) continue;
    seen.add(peerId);

    conversations.push({
      peer,
      lastMessage: {
        _id: m._id,
        body: m.body,
        createdAt: m.createdAt,
        senderId: m.senderId?._id,
        receiverId: m.receiverId?._id,
      },
    });
  }

  const start = (page - 1) * limit;
  const paged = conversations.slice(start, start + limit);

  const pagedWithUnread = await Promise.all(
    paged.map(async (c) => {
      const peerId = String(c.peer._id);
      const unreadCount = await Message.countDocuments({
        senderId: peerId,
        receiverId: myId,
        readAt: null,
      });
      return {
        ...c,
        unreadCount,
      };
    })
  );

  return res.status(200).json({
    conversations: pagedWithUnread,
    page,
    limit,
    total: conversations.length,
    hasMore: start + paged.length < conversations.length,
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

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: peerId },
      { senderId: peerId, receiverId: myId },
    ],
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  await Message.updateMany(
    { senderId: peerId, receiverId: myId, readAt: null },
    { $set: { readAt: new Date() } },
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

  const message = await Message.create({
    senderId: toId(myId),
    receiverId: toId(peerId),
    body,
  });

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
