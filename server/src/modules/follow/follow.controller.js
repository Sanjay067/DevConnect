import Follow from "./follow.model.js";
import User from "../user/users.model.js";
import Notification from "../notification/notification.model.js";
import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const followUser = asyncHandler(async (req, res) => {
  const followerId = req.user._id;
  const { followingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(followingId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  if (followerId.toString() === followingId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  const targetUser = await User.findById(followingId);
  if (!targetUser) return res.status(404).json({ message: "User not found" });

  const existingFollow = await Follow.findOne({ followerId, followingId });
  if (existingFollow) {
    return res.status(400).json({ message: "Already following this user" });
  }

  try {
    await Follow.create({ followerId, followingId });

    // Dispatch async notification creation & automatic 30-item capping
    Notification.create({
      recipientId: followingId,
      senderId: followerId,
      type: "FOLLOW",
    })
      .then(async () => {
        const excess = await Notification.find({ recipientId: followingId })
          .sort({ createdAt: -1 })
          .skip(30)
          .select("_id");

        if (excess.length > 0) {
          const idsToDelete = excess.map((n) => n._id);
          await Notification.deleteMany({ _id: { $in: idsToDelete } });
        }
      })
      .catch((err) => {
        console.error("Error creating notification:", err);
      });
  } catch (error) {
    if (error?.code === 11000) return res.status(400).json({ message: "Already following" });
    throw error;
  }

  return res.status(200).json({ message: "Successfully followed user" });
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const followerId = req.user._id;
  const { followingId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(followingId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  const follow = await Follow.findOneAndDelete({ followerId, followingId });
  if (!follow) return res.status(400).json({ message: "Not following this user" });

  return res.status(200).json({ message: "Successfully unfollowed user" });
});

export const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const followers = await Follow.find({ followingId: userId })
    .populate("followerId", "name username profilePicture");
  
  return res.status(200).json({ followers });
});

export const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const following = await Follow.find({ followerId: userId })
    .populate("followingId", "name username profilePicture");
  
  return res.status(200).json({ following });
});
