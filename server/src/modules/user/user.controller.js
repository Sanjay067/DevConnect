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

  if (normalizedUsername && !/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
    return res.status(400).json({
      message: "Username must be 3-30 lowercase letters, numbers, or underscores",
    });
  }

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

  if (name !== undefined) {
    const cleanName = String(name).trim().slice(0, 100);
    if (!cleanName) return res.status(400).json({ message: "Name cannot be empty" });
    user.name = cleanName;
  }

  if (normalizedEmail) user.email = normalizedEmail;

  if (normalizedUsername) user.username = normalizedUsername;

  if (skills !== undefined) {
    user.skills = (Array.isArray(skills) ? skills : String(skills).split(","))
      .map((s) => String(s).trim().slice(0, 50))
      .filter(Boolean)
      .slice(0, 50);
  }

  if (interests !== undefined) {
    user.interests = (Array.isArray(interests) ? interests : String(interests).split(","))
      .map((s) => String(s).trim().slice(0, 50))
      .filter(Boolean)
      .slice(0, 30);
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

  const scoreResult = await Post.aggregate([
    { $match: { author: user._id, isActive: true } },
    { $group: { _id: null, totalScore: { $sum: "$totalPoints" } } }
  ]);
  
  const totalScore = scoreResult[0]?.totalScore || 0;

  return res.json({
    ...userProfile.toObject(),
    followersCount,
    followingCount,
    totalScore,
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

  const scoreResult = await Post.aggregate([
    { $match: { author: user._id, isActive: true } },
    { $group: { _id: null, totalScore: { $sum: "$totalPoints" } } }
  ]);
  const totalScore = scoreResult[0]?.totalScore || 0;
  
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
      totalScore,
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

  const {
    bio,
    headline,
    currentPosition,
    location,
    socialLinks,
    pastWork,
    education,
    skills,
    bannerPicture,
  } = req.body;

  if (headline !== undefined) userProfile.headline = String(headline).trim().slice(0, 150);
  if (bio !== undefined) userProfile.bio = String(bio).trim().slice(0, 2000);
  if (currentPosition !== undefined) userProfile.currentPosition = String(currentPosition).trim().slice(0, 100);
  if (location !== undefined) userProfile.location = String(location).trim().slice(0, 100);
  if (bannerPicture !== undefined) userProfile.bannerPicture = String(bannerPicture).trim().slice(0, 500);

  if (skills !== undefined && Array.isArray(skills)) {
    userProfile.skills = skills
      .map((s) => String(s).trim().slice(0, 50))
      .filter(Boolean)
      .slice(0, 50);
  }

  if (socialLinks !== undefined && Array.isArray(socialLinks)) {
    userProfile.socialLinks = socialLinks
      .filter((link) => link && typeof link.url === "string" && /^https?:\/\//i.test(link.url.trim()))
      .map((link) => ({
        platform: String(link.platform || "custom").trim().slice(0, 30),
        url: link.url.trim().slice(0, 300),
      }))
      .slice(0, 20);
  }

  if (pastWork !== undefined && Array.isArray(pastWork)) {
    userProfile.pastWork = pastWork
      .map((w) => ({
        company: String(w.company || "").trim().slice(0, 100),
        position: String(w.position || "").trim().slice(0, 100),
        years: String(w.years || "").trim().slice(0, 50),
      }))
      .filter((w) => w.company || w.position || w.years)
      .slice(0, 20);
  }

  if (education !== undefined && Array.isArray(education)) {
    userProfile.education = education
      .map((e) => ({
        school: String(e.school || "").trim().slice(0, 100),
        degree: String(e.degree || "").trim().slice(0, 100),
        fieldOfStudy: String(e.fieldOfStudy || "").trim().slice(0, 100),
      }))
      .filter((e) => e.school || e.degree || e.fieldOfStudy)
      .slice(0, 20);
  }

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
