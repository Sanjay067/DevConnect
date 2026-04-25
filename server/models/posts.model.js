import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    authorName: String,
    authorUsername: String,
    authorProfilePicture: String,

    body: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    media: [
      {
        url: String,
        publicId: String,
        type: {
          type: String,
          enum: ["image", "video", "file"],
          required: true,
        },
      },
    ],

    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },

    score: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);


postSchema.index({ author: 1, isActive: 1, score: -1 });
postSchema.index({ isActive: 1, score: -1 });

export default mongoose.model("Post", postSchema);