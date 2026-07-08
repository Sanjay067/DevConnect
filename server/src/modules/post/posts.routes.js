import { Router } from "express";

import {
  getAllUserPosts,
  getPostById,
  createPost,
  deletePost,
  editPost,
  getPublicUserPosts,
} from "./posts.controller.js";
import { toggleLikePost, getPostLikes } from "../like/likes.controller.js";
import { verifyAccessToken } from "../../middlewares/verifyAccessToken.middleware.js";
import { isPostAuthor } from "../../middlewares/isPostAuthor.middleware.js";
import commentRoutes from "../comment/comments.routes.js";

const router = Router();


import { uploadPostMedia, uploadTempMedia } from "../../config/cloudinary.js";
import { uploadLimiter } from "../../middlewares/rateLimits.js";

router.post("/upload-asset", verifyAccessToken, uploadLimiter, uploadTempMedia.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  return res.status(200).json({ url: req.file.path, publicId: req.file.filename });
});

router.get("/user/:userId", verifyAccessToken, getPublicUserPosts);

router
  .route("/")
  .get(verifyAccessToken, getAllUserPosts)
  .post(verifyAccessToken, uploadPostMedia.array("media", 5), createPost);

router
  .route("/:postId")
  .get(verifyAccessToken, getPostById)
  .patch(verifyAccessToken, isPostAuthor, uploadPostMedia.array("media", 5), editPost)
  .delete(verifyAccessToken, isPostAuthor, deletePost);

// Like/unlike a post

router
  .route("/:postId/like")
  .get(verifyAccessToken, getPostLikes)
  .post(verifyAccessToken, toggleLikePost)

// Mount comment routes under /:postId/comments

router.use("/:postId/comments", commentRoutes);

export default router;
