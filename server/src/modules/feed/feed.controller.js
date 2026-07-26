import Follow from "../follow/follow.model.js";
import Post from "../post/posts.model.js";
import Like from "../like/likes.model.js";
import User from "../user/users.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { enrichPostWithRating } from "../post/posts.controller.js";

export const getFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));

  // Fetch full user to get skills (interests excluded as per user architecture decision)
  const user = await User.findById(userId).select("skills");
  const userSkills = (user?.skills || []).map(s => s.toLowerCase());

  // Fetch who the user follows
  const follows = await Follow.find({ followerId: userId }).select("followingId");
  const followingIds = follows.map(f => f.followingId);

  const match = { isActive: true };
  const totalInDb = await Post.countDocuments(match);

  const ageHoursExpr = {
    $max: [
      0,
      {
        $divide: [
          { $subtract: [new Date(), "$createdAt"] },
          1000 * 60 * 60
        ]
      }
    ]
  };

  const techStackLowerExpr = {
    $map: {
      input: { $ifNull: ["$techStack", []] },
      as: "t",
      in: { $toLower: "$$t" }
    }
  };

  const skillMatchExpr = {
    $multiply: [
      {
        $size: {
          $setIntersection: [techStackLowerExpr, userSkills]
        }
      },
      5
    ]
  };

  const pipeline = [
    { $match: match },
    {
      $addFields: {
        score: {
          $add: [
            // totalPointsScore: Math.log1p(totalPoints) * 3
            {
              $multiply: [
                { $ln: { $add: [{ $ifNull: ["$totalPoints", { $multiply: [{ $ifNull: ["$likeCount", 0] }, 10] }] }, 1] } },
                3
              ]
            },
            // averageRatingScore: averageRating * 2
            {
              $multiply: [
                { $ifNull: ["$averageRating", 0] },
                2
              ]
            },
            // commentScore: Math.log1p(commentCount) * 3
            {
              $multiply: [
                { $ln: { $add: [{ $ifNull: ["$commentCount", 0] }, 1] } },
                3
              ]
            },
            // recencyScore: 1 / (1 + ageHours / 6)
            {
              $divide: [
                1,
                {
                  $add: [
                    1,
                    { $divide: [ageHoursExpr, 6] }
                  ]
                }
              ]
            },
            // skillMatch
            skillMatchExpr,
            // networkScore: 10 if following author, else 0
            {
              $cond: [
                { $in: ["$author", followingIds] },
                10,
                0
              ]
            }
          ]
        }
      }
    },
    { $sort: { score: -1, createdAt: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "authorDetails"
      }
    },
    {
      $addFields: {
        author: { $arrayElemAt: ["$authorDetails", 0] }
      }
    },
    {
      $project: {
        authorDetails: 0,
        "author.password": 0,
        "author.email": 0
      }
    }
  ];

  const posts = await Post.aggregate(pipeline);

  const postIds = posts.map((p) => p._id);
  const userLikes = await Like.find({
    userId,
    targetId: { $in: postIds },
    targetType: "Post",
  }).select("targetId");
  const likedSet = new Set(userLikes.map((l) => String(l.targetId)));

  const paged = posts.map((post) => {
    const enriched = enrichPostWithRating(post, userId);
    if (likedSet.has(String(post._id)) && !enriched.userRatingScore) {
      enriched.userRatingScore = 10;
      enriched.isLiked = true;
    }
    return enriched;
  });

  const start = (page - 1) * limit;
  const hasMore = start + paged.length < totalInDb;

  return res.status(200).json({
    message: "Personalized feed fetched successfully",
    page,
    limit,
    total: totalInDb,
    hasMore,
    truncated: false, // Aggregation always scans globally, no truncation window required
    posts: paged,
  });
});
