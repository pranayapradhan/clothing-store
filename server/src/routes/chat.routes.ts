
import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
  getMyConversationController,
  getAdminConversationsController,
  getConversationMessagesController,
  sendChatMessageController,
  markChatMessagesReadController,
  getUnreadMessagesController,
  getAdminTotalUnreadCountController,
} from "../controllers/chat.controller.js";

import {
  uploadChatAttachmentController,
  downloadChatAttachmentController,
} from "../controllers/chat-attachment.controller.js";

import { chatAttachmentUpload } from "../middleware/chatAttachmentUpload.js";
import {
  chatConversationIdValidator,
  chatPaginationValidator,
  sendChatMessageValidator,
} from "../validators/chat.validator.js";

const router = Router();

router.use(authenticate);

router.get("/attachment-test", (_req, res) => {
  res.json({
    success: true,
    message: "Chat attachment routes are reachable",
  });
});
// Customer conversation
router.get(
  "/my-conversation",
  authorize("USER"),
  getMyConversationController,
);

// Admin conversation list
router.get(
  "/admin/conversations",
  authorize("ADMIN"),
  chatPaginationValidator,
  validate,
  getAdminConversationsController,
);

// Conversation message history
router.get(
  "/conversations/:id/messages",
  chatConversationIdValidator,
  chatPaginationValidator,
  validate,
  getConversationMessagesController,
);

// Send a message
router.post(
  "/conversations/:id/messages",
  chatConversationIdValidator,
  sendChatMessageValidator,
  validate,
  sendChatMessageController,
);

// Mark messages as read
router.patch(
  "/conversations/:id/read",
  chatConversationIdValidator,
  validate,
  markChatMessagesReadController,
);

// Get unread message count
router.get(
  "/conversations/:id/unread",
  chatConversationIdValidator,
  validate,
  getUnreadMessagesController,
);

// Get total unread messages across all customer conversations (Admin only)
router.get(
  "/admin/unread-count",
  authorize("ADMIN"),
  getAdminTotalUnreadCountController,
);

router.post(
  "/conversations/:id/attachments",
  chatConversationIdValidator,
  validate,
  chatAttachmentUpload,
  uploadChatAttachmentController,
);

router.get(
  "/attachments/:messageId/download",
  downloadChatAttachmentController,
);

export default router;
