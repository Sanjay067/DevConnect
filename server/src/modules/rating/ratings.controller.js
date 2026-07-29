import mongoose from "mongoose";
import Rating from "./ratings.model.js";
import Post from "../post/posts.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { updatePostScoreAsync } from "../post/score.worker.js";

export const ratePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { score } = req.body;
  const userId = req.user._id;

  // --- Validate score ---
  const targetScore = Number(score);
  if (!Number.isInteger(targetScore) || targetScore < 1 || targetScore > 10) {
    return res.status(400).json({ message: "Score must be an integer between 1 and 10" });
  }

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  // --- Load post ---
  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  // --- Block self-rating ---
  if (post.author.toString() === userId.toString()) {
    return res.status(403).json({ message: "You cannot rate your own post" });
  }

  // --- Upsert logic ---
  const existingRating = await Rating.findOne({ postId, userId });

  let pointsDelta = 0;
  let countDelta = 0;
  let newUserRatingScore = null;

  if (existingRating) {
    if (existingRating.score === targetScore) {
      // Toggle off — user clicked their current score again (un-rate)
      await Rating.deleteOne({ _id: existingRating._id });
      pointsDelta = -targetScore;
      countDelta = -1;
      newUserRatingScore = null;
    } else {
      // Score change (e.g. 6 → 9) — update in-place, no count change
      pointsDelta = targetScore - existingRating.score;
      existingRating.score = targetScore;
      await existingRating.save();
      newUserRatingScore = targetScore;
      countDelta = 0;
    }
  } else {
    // First time rating this post
    await Rating.create({ userId, postId, score: targetScore });
    pointsDelta = targetScore;
    countDelta = 1;
    newUserRatingScore = targetScore;
  }

  // --- Single atomic update on Post ---
  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    { $inc: { totalPoints: pointsDelta, ratingCount: countDelta } },
    { returnDocument: "after" }
  );

  // Recalculate averageRating
  const newRatingCount = Math.max(0, updatedPost.ratingCount);
  const newTotalPoints = Math.max(0, updatedPost.totalPoints);
  const newAverageRating =
    newRatingCount > 0 ? Number((newTotalPoints / newRatingCount).toFixed(1)) : 0;

  await Post.findByIdAndUpdate(postId, {
    $set: { averageRating: newAverageRating },
  });

  // Fire background score update (non-blocking)
  updatePostScoreAsync({
    ...updatedPost.toObject(),
    averageRating: newAverageRating,
  }).catch((err) => {
    console.error(`[RatePost] Failed to update score for post ${postId}:`, err);
  });

  return res.status(200).json({
    message: newUserRatingScore ? "Post rated successfully" : "Rating removed",
    userRatingScore: newUserRatingScore,
    totalPoints: newTotalPoints,
    averageRating: newAverageRating,
    ratingCount: newRatingCount,
    likeCount: updatedPost.likeCount,
  });
});
