import User from "./users.model.js";
import Profile from "./profile.model.js";
import Follow from "../follow/follow.model.js";
import Post from "../post/posts.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";



const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const updateAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) return res.status(400).json({ message: "User doesn't exist" });

  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  user.profilePicture = req.file.path;
  await user.save();

  return res.status(200).json({
    message: "Profile picture updated",
    profilePicture: user.profilePicture,
  });
});

export const updateBanner = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne({ userId: req.user._id });

  if (!profile) {
    profile = new Profile({
      userId: req.user._id,
      headline: "",
      bio: "",
      currentPosition: "",
    });
  }

  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  profile.bannerPicture = req.file.path;
  await profile.save();

  return res.status(200).json({
    message: "Banner picture updated",
    bannerPicture: profile.bannerPicture,
  });
});



export const updateUser = asyncHandler(async (req, res) => {
  const newUserData = req.body;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).json({ message: "User doesn't exist" });

  const { email, username, name, skills, interests } = newUserData;

  // Normalize identifiers to lowercase to match how they're stored
  const normalizedEmail = email ? String(email).toLowerCase().trim() : undefined;
  const normalizedUsername = username ? String(username).toLowerCase().trim() : undefined;

  if (normalizedUsername || normalizedEmail) {
    const orConditions = [];
    if (normalizedUsername) orConditions.push({ username: normalizedUsername });
    if (normalizedEmail) orConditions.push({ email: normalizedEmail });
    const existingUser = await User.findOne({ $or: orConditions });

    if (existingUser && String(existingUser._id) !== String(user._id)) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }
  }

  if (name) user.name = name;

  if (normalizedEmail) user.email = normalizedEmail;

  if (normalizedUsername) user.username = normalizedUsername;

  if (skills !== undefined) {
    user.skills = Array.isArray(skills)
      ? skills
      : String(skills)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
  }

  if (interests !== undefined) {
    user.interests = Array.isArray(interests)
      ? interests
      : String(interests)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
  }

  await user.save();

  return res.status(200).json({ message: "Changes updated" });
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).json({ message: "user doesn't exist" });

  let userProfile = await Profile.findOne({ userId: user._id }).populate(
    "userId",
    "name email username profilePicture skills interests",
  );

  if (!userProfile) {
    userProfile = new Profile({
      userId: user._id,
      headline: "",
      bio: "",
      currentPosition: "",
    });
    await userProfile.save();
    await userProfile.populate(
      "userId",
      "name email username profilePicture skills interests"
    );
  }

  const followersCount = await Follow.countDocuments({ followingId: user._id });
  const followingCount = await Follow.countDocuments({ followerId: user._id });

  return res.json({
    ...userProfile.toObject(),
    followersCount,
    followingCount,
  });
});


export const getPublicUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId)
    return res.status(400).json({ message: "User ID is required" });

  const user = await User.findById(userId).select(
    "name username profilePicture interests",
  );
  if (!user) return res.status(404).json({ message: "User not found" });

  const userProfile = await Profile.findOne({ userId: user._id }).populate(
    "userId",
    "name username profilePicture interests",
  );

  if (!userProfile) {
    return res.status(200).json({
      profile: null,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        profilePicture: user.profilePicture,
        interests: user.interests || [],
      },
    });
  }

  await userProfile.populate("userId", "name username profilePicture interests");

  const followersCount = await Follow.countDocuments({ followingId: user._id });
  const followingCount = await Follow.countDocuments({ followerId: user._id });
  
  let isFollowing = false;
  if (req.user) {
    const follow = await Follow.findOne({ followerId: req.user._id, followingId: user._id });
    isFollowing = !!follow;
  }

  return res.status(200).json({ 
    profile: {
      ...userProfile.toObject(),
      followersCount,
      followingCount,
      isFollowing
    }
  });
});

export const getAllProfiles = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 24)));
  const skip = (page - 1) * limit;
  const { q } = req.query;

  // Query Profiles excluding the current user's profile
  let filter = { userId: { $ne: req.user._id } };

  if (q && String(q).trim()) {
    const safeQuery = escapeRegex(String(q).trim());
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: safeQuery, $options: "i" } },
        { username: { $regex: safeQuery, $options: "i" } }
      ]
    }).select("_id");
    const userIds = matchingUsers.map((u) => u._id);

    filter = {
      userId: { $ne: req.user._id },
      $or: [
        { userId: { $in: userIds } },
        { skills: { $regex: safeQuery, $options: "i" } }
      ]
    };
  }

  const total = await Profile.countDocuments(filter);

  const rows = await Profile.find(filter)
    .populate("userId", "name username profilePicture")
    .skip(skip)
    .limit(limit)
    .lean();

  // Filter out rows where userId population failed (deleted users)
  const validRows = rows.filter((p) => p.userId);
  const userIds = validRows.map((p) => p.userId._id);

  // Bulk aggregation: followers counts for all userIds in one query
  const followerAgg = await Follow.aggregate([
    { $match: { followingId: { $in: userIds } } },
    { $group: { _id: "$followingId", count: { $sum: 1 } } },
  ]);
  const followerMap = new Map(followerAgg.map((r) => [String(r._id), r.count]));

  // Bulk aggregation: post counts for all userIds in one query
  const postAgg = await Post.aggregate([
    { $match: { author: { $in: userIds }, isActive: true } },
    { $group: { _id: "$author", count: { $sum: 1 } } },
  ]);
  const postMap = new Map(postAgg.map((r) => [String(r._id), r.count]));

  const profiles = validRows.map((p) => ({
    _id: p.userId._id,
    username: p.userId.username,
    name: p.userId.name,
    profilePicture: p.userId.profilePicture,
    headline: p.headline,
    bio: p.bio,
    skills: p.skills || [],
    followersCount: followerMap.get(String(p.userId._id)) || 0,
    projectsCount: postMap.get(String(p.userId._id)) || 0,
  }));

  return res.status(200).json({
    profiles,
    page,
    limit,
    total,
    hasMore: skip + profiles.length < total,
  });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).json({ message: "User doesn't exist" });

  const userProfile = await Profile.findOne({ userId: user._id });

  if (!userProfile)
    return res.status(400).json({ message: "Profile not found" });

  const allowedFields = [
    "bio",
    "pastWork",
    "education",
    "currentPosition",
    "headline",
    "location",
    "socialLinks",
    "skills",
    "bannerPicture"
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      userProfile[field] = req.body[field];
    }
  });

  await userProfile.save();
  await userProfile.populate("userId", "name email username profilePicture");

  return res.status(200).json({
    message: "Profile updated successfully",
    userProfile,
  });
});


export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(200).json([]);
  const raw = String(q).trim().slice(0, 64);
  if (!raw) return res.status(200).json([]);
  const safe = escapeRegex(raw);

  const users = await User.find({
    $or: [
      { name: { $regex: safe, $options: "i" } },
      { username: { $regex: safe, $options: "i" } }
    ]
  })
    .select("_id name username profilePicture")
    .limit(25);

  return res.status(200).json(users);
});
