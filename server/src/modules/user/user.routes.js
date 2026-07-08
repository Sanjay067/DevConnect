import { Router } from "express";
import {
  updateAvatar,
  getMyProfile,
  getAllProfiles,
  updateMyProfile,
  updateUser,
  getPublicUserProfile,
  searchUsers,
  updateBanner,
} from "./user.controller.js";
import { uploadAvatar, uploadBanner } from "../../config/cloudinary.js";
import { verifyAccessToken } from "../../middlewares/verifyAccessToken.middleware.js";

const router = Router();

router.get("/profiles/me", verifyAccessToken, getMyProfile);

// Another user's profile (for deep links)
router.get("/profile/:userId", verifyAccessToken, getPublicUserProfile);

// Get all profiles
router.get("/profiles", verifyAccessToken, getAllProfiles);

// Search users
router.get("/search", verifyAccessToken, searchUsers);



// Update profile (bio, pastWork, education)
router.patch("/profiles/me", verifyAccessToken, updateMyProfile);

// Update user account (name, email, username)
router.patch("/me", verifyAccessToken, updateUser);

// Update avatar
router.patch(
  "/profiles/me/avatar",
  verifyAccessToken,
  uploadAvatar.single("avatar"),
  updateAvatar,
);

// Update banner
router.patch(
  "/profiles/me/banner",
  verifyAccessToken,
  uploadBanner.single("banner"),
  updateBanner,
);



export default router;
