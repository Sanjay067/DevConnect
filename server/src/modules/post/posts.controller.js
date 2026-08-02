import mongoose from "mongoose";

import Post from "./posts.model.js";
import Like from "../like/likes.model.js";
import Comment from "../comment/comments.model.js";
import Rating from "../rating/ratings.model.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { cloudinary } from "../../config/cloudinary.js";
import {
  extractCloudinaryPublicIdsFromPost,
  extractCloudinaryPublicIdsFromText,
  destroyCloudinaryAssets,
} from "../../utils/cloudinaryMarkdown.js";

const parseJSON = (data, fallback = []) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  }
  return data || fallback;
};

const promoteTempAssets = async (markdownText) => {
  if (!markdownText) return markdownText;

  let updatedText = markdownText;
  const tempUrlRegex = /https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/(?:v\d+\/)?(devConnect\/temp\/[^\.]+)\.[a-zA-Z0-9]+/g;

  const matches = [...markdownText.matchAll(tempUrlRegex)];
  const seen = new Set();
  const uniqueMatches = [];

  for (const match of matches) {
    const oldPublicId = match[1];
    if (!seen.has(oldPublicId)) {
      seen.add(oldPublicId);
      uniqueMatches.push(match);
    }
  }

  for (const match of uniqueMatches) {
    const fullUrl = match[0];
    const oldPublicId = match[1];
    const newPublicId = oldPublicId.replace("devConnect/temp/", "devConnect/posts/");

    try {
      console.log(`Promoting asset: ${oldPublicId} -> ${newPublicId}`);
      const renameResult = await cloudinary.uploader.rename(oldPublicId, newPublicId);
      updatedText = updatedText.replaceAll(fullUrl, renameResult.secure_url);
    } catch (error) {
      console.error(`Failed to promote asset ${oldPublicId}:`, error.message);
      const fallbackUrl = fullUrl.replace("/devConnect/temp/", "/devConnect/posts/");
      updatedText = updatedText.replaceAll(fullUrl, fallbackUrl);
    }
  }

  return updatedText;
};


/**
 * Attaches `userRatingScore` and `isLiked` to a post object.
 * Expects `userRatingScore` to be pre-fetched from the Rating collection
 * (injected via `userRatingsMap` where keys are postId strings).
 *
 * For backwards compat: falls back to `isLiked` from the Like model.
 */
export const enrichPostWithRating = (postObj, userRatingsMap = {}, likedSet = new Set()) => {
  if (!postObj) return postObj;
  const postId = String(postObj._id);
  const userRatingScore = userRatingsMap[postId] ?? null;
  return {
    ...postObj,
    userRatingScore,
    isLiked: likedSet.has(postId) || userRatingScore !== null,
  };
};

export const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId).populate(
    "author",
    "name username profilePicture"
  );

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const userId = req.user._id;
  const isAuthor = post.author._id.toString() === userId.toString();

  const userLike = await Like.findOne({
    userId,
    targetId: post._id,
    targetType: "Post",
  }).select("_id");

  const enriched = enrichPostWithRating(post.toObject(), userId);
  if (userLike && !enriched.userRatingScore) {
    enriched.userRatingScore = 10;
    enriched.isLiked = true;
  }

  return res.status(200).json({
    message: "Post fetched successfully",
    post: {
      ...enriched,
      isAuthor,
    },
  });
});

export const getAllUserPosts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // Sort by newest first and populate author
  const posts = await Post.find({ author: userId })
    .populate("author", "name username profilePicture")
    .sort({ createdAt: -1 });

  const postIds = posts.map((p) => p._id);
  const [userLikes, userRatings] = await Promise.all([
    Like.find({
      userId,
      targetId: { $in: postIds },
      targetType: "Post",
    }).select("targetId"),
    Rating.find({
      userId,
      postId: { $in: postIds },
    }).select("postId score"),
  ]);

  const likedSet = new Set(userLikes.map((l) => String(l.targetId)));
  const userRatingsMap = {};
  for (const r of userRatings) {
    userRatingsMap[String(r.postId)] = r.score;
  }

  const finalPosts = posts.map((p) =>
    enrichPostWithRating(p.toObject(), userRatingsMap, likedSet)
  );

  return res
    .status(200)
    .json({ message: "Posts fetched successfully", posts: finalPosts });
});

export const getPublicUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const posts = await Post.find({ author: userId })
    .populate("author", "name username profilePicture")
    .sort({ createdAt: -1 });

  const postIds = posts.map((p) => p._id);
  let likedSet = new Set();
  const userRatingsMap = {};

  if (currentUserId) {
    const [userLikes, userRatings] = await Promise.all([
      Like.find({
        userId: currentUserId,
        targetId: { $in: postIds },
        targetType: "Post",
      }).select("targetId"),
      Rating.find({
        userId: currentUserId,
        postId: { $in: postIds },
      }).select("postId score"),
    ]);

    likedSet = new Set(userLikes.map((l) => String(l.targetId)));
    for (const r of userRatings) {
      userRatingsMap[String(r.postId)] = r.score;
    }
  }

  const finalPosts = posts.map((p) =>
    enrichPostWithRating(p.toObject(), userRatingsMap, likedSet)
  );

  return res.status(200).json({ posts: finalPosts });
});

export const createPost = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    shortDescription,
    links,
    techStack,
    lookingForContributors,
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Post title is required" });
  }

  const parsedContent = parseJSON(content, null);
  if (!parsedContent || !parsedContent.blocks || parsedContent.blocks.length === 0) {
    return res.status(400).json({ message: "Valid content is required" });
  }

  // Promote temp assets in ALL blocks, not just the first
  for (const block of parsedContent.blocks) {
    if (block?.data?.text) {
      block.data.text = await promoteTempAssets(block.data.text);
    }
  }

  const media = (req.files || []).map((file) => ({
    publicId: file.filename,
    type: file.mimetype.startsWith("image/")
      ? "image"
      : file.mimetype.startsWith("video/")
        ? "video"
        : "file",
  }));

  const parsedLinks = parseJSON(links, []);
  const parsedTechStack = parseJSON(techStack, []);
  const isLooking = lookingForContributors === "true" || lookingForContributors === true;

  const newPost = await Post.create({
    author: req.user._id,
    title,
    shortDescription,
    content: parsedContent,
    media,
    links: parsedLinks,
    techStack: parsedTechStack,
    lookingForContributors: isLooking,
  });

  return res.status(201).json({
    message: "Post created successfully",
    post: newPost,
  });
});

export const editPost = asyncHandler(async (req, res) => {
  const { title, content, shortDescription, existingMedia, links, techStack, lookingForContributors } = req.body;

  if (title !== undefined && !title?.trim()) {
    return res.status(400).json({ message: "Post title is required" });
  }

  let parsedContent = content;
  if (content !== undefined) {
    parsedContent = parseJSON(content, null);
    if (!parsedContent || !parsedContent.blocks || parsedContent.blocks.length === 0) {
      return res.status(400).json({ message: "Valid content is required" });
    }
  }

  const post = await Post.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const originalMedia = post.media || [];
  const keepMedia = existingMedia !== undefined ? parseJSON(existingMedia, []) : originalMedia;

  const deletedMedia = originalMedia.filter(
    (om) => !keepMedia.find((km) => km.publicId === om.publicId)
  );

  const oldMarkdown = post.content?.blocks?.[0]?.data?.text || "";

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newMedia = (req.files || []).map((file) => ({
      publicId: file.filename,
      type: file.mimetype.startsWith("image/")
        ? "image"
        : file.mimetype.startsWith("video/")
          ? "video"
          : "file",
    }));

    const finalMedia = [...keepMedia, ...newMedia];

    if (title !== undefined) post.title = title.trim();
    if (shortDescription !== undefined) post.shortDescription = shortDescription?.trim();
    if (parsedContent !== undefined) {
      // Promote temp assets in ALL blocks, not just the first
      for (const block of parsedContent.blocks || []) {
        if (block?.data?.text) {
          block.data.text = await promoteTempAssets(block.data.text);
        }
      }
      post.content = parsedContent;
    }
    post.media = finalMedia;

    if (links !== undefined) post.links = parseJSON(links, []);
    if (techStack !== undefined) post.techStack = parseJSON(techStack, []);

    if (lookingForContributors !== undefined) {
      post.lookingForContributors = lookingForContributors === "true" || lookingForContributors === true;
    }

    await post.save({ session });

    await session.commitTransaction();
    session.endSession();

    const newMarkdown = parsedContent?.blocks?.[0]?.data?.text ?? oldMarkdown;
    const removedInlineIds = extractCloudinaryPublicIdsFromText(oldMarkdown).filter(
      (id) => !extractCloudinaryPublicIdsFromText(newMarkdown).includes(id)
    );

    for (const file of deletedMedia) {
      try {
        await cloudinary.uploader.destroy(file.publicId);
      } catch (_) { }
    }

    await destroyCloudinaryAssets(cloudinary, removedInlineIds);

    await post.populate("author", "username profilePicture");

    return res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});




export const deletePost = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const post = await Post.findById(req.params.postId).session(session);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const mediaToDelete = post.media || [];
    const inlineAssetIds = extractCloudinaryPublicIdsFromPost(post);

    await Like.deleteMany({
      targetId: post._id,
      targetType: "Post",
    }).session(session);

    const commentIds = await Comment.find({ postId: post._id })
      .session(session)
      .distinct("_id");

    if (commentIds.length > 0) {
      await Like.deleteMany({
        targetId: { $in: commentIds },
        targetType: "Comment",
      }).session(session);
    }

    await Comment.deleteMany({
      postId: post._id,
    }).session(session);

    await Post.deleteOne({ _id: post._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    const allPublicIds = [
      ...mediaToDelete.map((f) => f.publicId).filter(Boolean),
      ...inlineAssetIds,
    ];
    await destroyCloudinaryAssets(cloudinary, [...new Set(allPublicIds)]);

    return res.status(200).json({ message: "Post deleted!" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

export const toggleFeaturePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  post.isFeatured = !post.isFeatured;
  await post.save();

  return res.status(200).json({
    message: post.isFeatured ? "Post pinned to featured" : "Post removed from featured",
    post,
  });
});

export const ratePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { score } = req.body;
  const userId = req.user._id;

  const targetScore = Number(score);
  if (isNaN(targetScore) || targetScore < 1 || targetScore > 10) {
    return res.status(400).json({ message: "Score must be a number between 1 and 10" });
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (!post.ratings) post.ratings = [];

  const existingRatingIndex = post.ratings.findIndex(
    (r) => r.userId.toString() === userId.toString()
  );

  let newUserRatingScore = null;

  if (existingRatingIndex !== -1) {
    if (post.ratings[existingRatingIndex].score === targetScore) {
      // Toggle off (remove rating)
      post.ratings.splice(existingRatingIndex, 1);
      newUserRatingScore = null;
    } else {
      // Update rating score
      post.ratings[existingRatingIndex].score = targetScore;
      newUserRatingScore = targetScore;
    }
  } else {
    // Add new rating score
    post.ratings.push({ userId, score: targetScore });
    newUserRatingScore = targetScore;
  }

  // Recalculate rating metrics: sum of score ratings + legacy likes * 10
  const ratingsSum = post.ratings.reduce((sum, r) => sum + r.score, 0);
  const legacyLikesCount = post.likes?.length || 0;
  const legacyPoints = legacyLikesCount * 10;
  const totalCount = post.ratings.length + legacyLikesCount;

  post.totalPoints = ratingsSum + legacyPoints;
  post.ratingCount = totalCount;
  post.likeCount = totalCount;
  post.averageRating = totalCount > 0 ? Number((post.totalPoints / totalCount).toFixed(1)) : 0;

  await post.save();

  const enriched = enrichPostWithRating(post.toObject(), userId);

  return res.status(200).json({
    message: newUserRatingScore ? "Post rated successfully" : "Rating removed",
    post: enriched,
  });
});
