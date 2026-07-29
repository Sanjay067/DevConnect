import Follow from "../follow/follow.model.js";
import Post from "../post/posts.model.js";
import Like from "../like/likes.model.js";
import Rating from "../rating/ratings.model.js";
import User from "../user/users.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { enrichPostWithRating } from "../post/posts.controller.js";

export const getFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));

  // Fetch user skills for relevance scoring
  const user = await User.findById(userId).select("skills");
  const userSkills = (user?.skills || []).map((s) => s.toLowerCase());

  // Fetch who the user follows
  const follows = await Follow.find({ followerId: userId }).select("followingId");
  const followingIds = follows.map((f) => f.followingId);

  const match = { isActive: true };
  const totalInDb = await Post.countDocuments(match);

  const ageHoursExpr = {
    $max: [
      0,
      {
        $divide: [
          { $subtract: [new Date(), "$createdAt"] },
          1000 * 60 * 60,
        ],
      },
    ],
  };

  const techStackLowerExpr = {
    $map: {
      input: { $ifNull: ["$techStack", []] },
      as: "t",
      in: { $toLower: "$$t" },
    },
  };

  const skillMatchExpr = {
    $multiply: [
      {
        $size: {
          $setIntersection: [techStackLowerExpr, userSkills],
        },
      },
      5,
    ],
  };

  const pipeline = [
    { $match: match },
    {
      $addFields: {
        computedScore: {
          $add: [
            // totalPoints signal: log1p(totalPoints) * 3
            {
              $multiply: [
                {
                  $ln: {
                    $add: [{ $ifNull: ["$totalPoints", 0] }, 1],
                  },
                },
                3,
              ],
            },
            // averageRating signal: averageRating * 2
            {
              $multiply: [{ $ifNull: ["$averageRating", 0] }, 2],
            },
            // commentCount signal: log1p(commentCount) * 3
            {
              $multiply: [
                {
                  $ln: {
                    $add: [{ $ifNull: ["$commentCount", 0] }, 1],
                  },
                },
                3,
              ],
            },
            // Recency signal: 1 / (1 + ageHours / 6)
            {
              $divide: [1, { $add: [1, { $divide: [ageHoursExpr, 6] }] }],
            },
            // Skill match
            skillMatchExpr,
            // Network boost: +10 if following the author
            {
              $cond: [{ $in: ["$author", followingIds] }, 10, 0],
            },
          ],
        },
      },
    },
    { $sort: { computedScore: -1, createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "authorDetails",
      },
    },
    {
      $addFields: {
        author: { $arrayElemAt: ["$authorDetails", 0] },
      },
    },
    {
      $project: {
        authorDetails: 0,
        "author.password": 0,
        "author.email": 0,
      },
    },
  ];

  const posts = await Post.aggregate(pipeline);
  const postIds = posts.map((p) => p._id);

  // Batch fetch: user's likes and ratings for this page — 2 DB calls total (not N+1)
  const [userLikes, userRatings] = await Promise.all([
    Like.find({ userId, targetId: { $in: postIds }, targetType: "Post" }).select("targetId"),
    Rating.find({ userId, postId: { $in: postIds } }).select("postId score"),
  ]);

  const likedSet = new Set(userLikes.map((l) => String(l.targetId)));
  const userRatingsMap = {};
  for (const r of userRatings) {
    userRatingsMap[String(r.postId)] = r.score;
  }

  const paged = posts.map((post) =>
    enrichPostWithRating(post, userRatingsMap, likedSet)
  );

  const start = (page - 1) * limit;
  const hasMore = start + paged.length < totalInDb;

  return res.status(200).json({
    message: "Personalized feed fetched successfully",
    page,
    limit,
    total: totalInDb,
    hasMore,
    posts: paged,
  });
});
