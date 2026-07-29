import Post from "./posts.model.js";

export const updatePostScoreAsync = async (postDoc) => {
  try {
    const safeLikeCount     = Math.max(0, postDoc.likeCount     || 0);
    const safeCommentCount  = Math.max(0, postDoc.commentCount  || 0);
    const safeRatingCount   = Math.max(0, postDoc.ratingCount   || 0);
    const safeAverageRating = Math.max(0, postDoc.averageRating || 0);

    // Like engagement signal
    const likeScore = Math.log1p(safeLikeCount) * 2;

    // Comment engagement signal
    const commentScore = Math.log1p(safeCommentCount) * 3;

    // Developer rating quality signal
    // Higher weight when more raters have contributed (log dampens outliers)
    const ratingScore = Math.log1p(safeRatingCount) * safeAverageRating * 0.5;

    // Recency decay: half-life of ~6 hours
    const createdAt = postDoc.createdAt ? new Date(postDoc.createdAt).getTime() : Date.now();
    const ageHours  = Math.max(0, (Date.now() - createdAt) / (1000 * 60 * 60));
    const recencyScore = 1 / (1 + ageHours / 6);

    let baselineScore = likeScore + commentScore + ratingScore + recencyScore;

    // Guard against NaN / Infinity from edge-case math
    if (!Number.isFinite(baselineScore)) baselineScore = 0;

    await Post.updateOne({ _id: postDoc._id }, { $set: { score: baselineScore } });
  } catch (error) {
    console.error(`[Background Task] Failed to update score for post ${postDoc?._id}:`, error);
  }
};
