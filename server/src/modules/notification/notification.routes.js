import { Router } from "express";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationsRead,
} from "./notification.controller.js";
import { verifyAccessToken } from "../../middlewares/verifyAccessToken.middleware.js";

const router = Router();

router.use(verifyAccessToken);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadNotificationsCount);
router.patch("/mark-read", markNotificationsRead);

export default router;
