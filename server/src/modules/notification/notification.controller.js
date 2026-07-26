import Notification from "./notification.model.js";
import Follow from "../follow/follow.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("senderId", "name username profilePicture")
    .lean();

  const senderIds = notifications
    .map((n) => n.senderId?._id)
    .filter(Boolean);

  const follows = await Follow.find({
    followerId: req.user._id,
    followingId: { $in: senderIds },
  }).lean();

  const followingSet = new Set(follows.map((f) => f.followingId.toString()));

  const enrichedNotifications = notifications.map((n) => {
    if (n.senderId) {
      n.senderId.isFollowing = followingSet.has(n.senderId._id.toString());
    }
    return n;
  });

  return res.status(200).json({ notifications: enrichedNotifications });
});

// GET /api/notifications/unread-count
export const getUnreadNotificationsCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipientId: req.user._id,
    isRead: false,
  });

  return res.status(200).json({ count });
});

// PATCH /api/notifications/mark-read
export const markNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipientId: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  return res.status(200).json({ message: "Notifications marked as read" });
});
