import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/verifyAccessToken.middleware.js";
import {
  getConversations,
  getConversationMessages,
  getUnreadCount,
  sendMessage,
  deleteMessage,
} from "./message.controller.js";

const router = Router();

router.get("/conversations", verifyAccessToken, getConversations);
router.get("/unread-count", verifyAccessToken, getUnreadCount);
router.get("/:peerId", verifyAccessToken, getConversationMessages);
router.post("/:peerId", verifyAccessToken, sendMessage);
router.delete("/delete/:messageId", verifyAccessToken, deleteMessage);

export default router;
