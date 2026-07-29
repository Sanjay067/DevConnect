import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
  },
  { timestamps: true }
);

// One rating per user per post
ratingSchema.index({ postId: 1, userId: 1 }, { unique: true });
// Quick lookup: "did this user rate this post?"
ratingSchema.index({ userId: 1 });

export default mongoose.model("Rating", ratingSchema);
