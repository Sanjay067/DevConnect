import Like from "../models/likes.model.js";
import Post from "../models/posts.model.js";


export const getPostLikes = async (req, res) => {
  try {
    const postId = req.params.postId;

    const likes = await Like.find({ targetId: postId, targetType: "Post" }).populate("userId", "name username profilePicture");

    return res.json({ message: "Likes fetched successfully", likes });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export const toggleLikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.postId;


    const existingLike = await Like.findOne({
      userId,
      targetId: postId,
      targetType: "Post",
    });




    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });

      await Post.updateOne(
        { _id: postId },
        [
          {
            $set: {
              likeCount: { $max: [{ $subtract: ["$likeCount", 1] }, 0] },
            },
          },
          {
            $set: {
              score: {
                $add: [
                  { $multiply: [{ $ln: { $add: ["$likeCount", 1] } }, 2] },
                  { $multiply: [{ $ln: { $add: ["$commentCount", 1] } }, 3] },
                  {
                    $divide: [
                      1,
                      {
                        $add: [
                          1,
                          {
                            $divide: [
                              {
                                $divide: [
                                  { $subtract: ["$$NOW", "$createdAt"] },
                                  1000 * 60 * 60,
                                ],
                              },
                              6,
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          },
        ]
      );

      return res.json({ message: "Post unliked" });
    }




    await Like.create({
      userId,
      targetId: postId,
      targetType: "Post",
    });

    await Post.updateOne(
      { _id: postId },
      [
        {
          $set: {
            likeCount: { $add: ["$likeCount", 1] },
          },
        },
        {
          $set: {
            score: {
              $add: [
                { $multiply: [{ $ln: { $add: ["$likeCount", 2] } }, 2] },
                { $multiply: [{ $ln: { $add: ["$commentCount", 1] } }, 3] },
                {
                  $divide: [
                    1,
                    {
                      $add: [
                        1,
                        {
                          $divide: [
                            {
                              $divide: [
                                { $subtract: [new Date(), "$createdAt"] },
                                1000 * 60 * 60,
                              ],
                            },
                            6,
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
      ]
    );

    return res.json({ message: "Post liked" });

  } catch (err) {

    if (err.code === 11000) {
      return res.json({ message: "Already liked" });
    }

    return res.status(500).json({ message: err.message });
  }
};