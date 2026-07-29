import { Router } from "express";

import {
  getAllUserPosts,
  getPostById,
  createPost,
  deletePost,
  editPost,
  getPublicUserPosts,
  toggleFeaturePost,
} from "./posts.controller.js";
import { toggleLikePost, getPostLikes } from "../like/likes.controller.js";
import { ratePost } from "../rating/ratings.controller.js";
import { verifyAccessToken } from "../../middlewares/verifyAccessToken.middleware.js";
import { isPostAuthor } from "../../middlewares/isPostAuthor.middleware.js";
import commentRoutes from "../comment/comments.routes.js";
import { uploadPostMedia, uploadTempMedia } from "../../config/cloudinary.js";
import { uploadLimiter, ratingLimiter } from "../../middlewares/rateLimits.js";

const router = Router();

router.post("/upload-asset", verifyAccessToken, uploadLimiter, uploadTempMedia.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  return res.status(200).json({ url: req.file.path, publicId: req.file.filename });
});

router.get("/user/:userId", verifyAccessToken, getPublicUserPosts);

router
  .route("/")
  .get(verifyAccessToken, getAllUserPosts)
  .post(verifyAccessToken, uploadLimiter, uploadPostMedia.array("media", 5), createPost);

router
  .route("/:postId")
  .get(verifyAccessToken, getPostById)
  .patch(verifyAccessToken, isPostAuthor, uploadLimiter, uploadPostMedia.array("media", 5), editPost)
  .delete(verifyAccessToken, isPostAuthor, deletePost);

// Like/unlike a post
router
  .route("/:postId/like")
  .get(verifyAccessToken, getPostLikes)
  .post(verifyAccessToken, toggleLikePost);

// Rate a post (1–10)
router.patch("/:postId/rate", verifyAccessToken, ratingLimiter, ratePost);

// Feature/unfeature (author only)
router.patch("/:postId/feature", verifyAccessToken, isPostAuthor, toggleFeaturePost);

// Mount comment routes under /:postId/comments
router.use("/:postId/comments", commentRoutes);

export default router;
