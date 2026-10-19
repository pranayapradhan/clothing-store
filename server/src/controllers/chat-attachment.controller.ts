
import type { Request, Response } from "express";
import type { Server } from "socket.io";
import multer from "multer";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { ChatMessage } from "../models/index.js";
import {
  createChatAttachmentMessage,
  getChatAttachmentDownloadUrl,
} from "../services/chat-attachment.service.js";

import {
  ChatServiceError,
  getConversationForUser,
} from "../services/chat.service.js";

const getId = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value ?? "";

const respondError = (error: unknown, res: Response) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Maximum attachment size is 10 MB"
          : error.message,
    });
  }

  if (error instanceof ChatServiceError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Chat attachment error:", error);

  return res.status(500).json({
    success: false,
    message: "Unable to process chat attachment",
  });
};

export const uploadChatAttachmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      throw new ChatServiceError("Authentication required", 401);
    }

    const conversationId = getId(req.params.id);

    if (!req.file) {
      throw new ChatServiceError("Please select a file", 400);
    }

    const caption =
      typeof req.body.message === "string"
        ? req.body.message
        : "";

    const message = await createChatAttachmentMessage({
      conversationId,
      senderId: req.user.id,
      role: req.user.role,
      file: req.file,
      caption,
    });

    const io = req.app.get("io") as Server | undefined;

    if (io) {
      const conversation = await getConversationForUser(
        conversationId,
        req.user.id,
        req.user.role,
      );

      const event = {
        conversationId,
        message,
      };

      io.to(`conversation:${conversationId}`).emit(
        "chat:message",
        event,
      );

      io.to(`user:${req.user.id}`).emit(
        "chat:message",
        event,
      );

      const notification = {
        conversationId,
        messageId: message.id,
        senderId: message.senderId,
        senderRole: req.user.role,
        preview:
          caption.trim().slice(0, 120) ||
          `Sent ${message.attachmentType === "IMAGE" ? "a photo" : "a file"}`,
        createdAt: new Date(message.createdAt).toISOString(),
      };

      if (req.user.role === "USER") {
        io.to("role:ADMIN").emit(
          "chat:notification",
          notification,
        );
      } else {
        io.to(`user:${conversation.customerId}`).emit(
          "chat:notification",
          notification,
        );
      }
    }

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    return respondError(error, res);
  }
};


export const downloadChatAttachmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      throw new ChatServiceError("Authentication required", 401);
    }

    const messageId = getId(req.params.messageId);

    // Retrieve the message and its attachment metadata.
    const message = await ChatMessage.findByPk(messageId);

    if (!message || !message.attachmentPublicId) {
      throw new ChatServiceError("Attachment not found", 404);
    }

    // Verify that this user can access the conversation.
    await getConversationForUser(
      message.conversationId,
      req.user.id,
      req.user.role,
    );

    // Reuse the existing signed Cloudinary URL generator.
    const signedUrl = await getChatAttachmentDownloadUrl({
      messageId,
      userId: req.user.id,
      role: req.user.role,
    });

    // The backend fetches Cloudinary instead of redirecting
    // the browser to a different origin.
    const upstream = await fetch(signedUrl);

    if (!upstream.ok || !upstream.body) {
      console.error(
        "Cloudinary download failed:",
        upstream.status,
        upstream.statusText,
      );

      return res.status(502).json({
        success: false,
        message: "Unable to retrieve attachment from storage",
      });
    }

    const filename = (
      message.attachmentName || "attachment"
    )
      .replace(/[\r\n"\\]/g, "_")
      .slice(0, 255);

    res.setHeader(
      "Content-Type",
      message.attachmentMimeType || "application/octet-stream",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename.replace(/[^\x20-\x7E]/g, "_")}"`,
    );

    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    if (message.attachmentSize) {
      res.setHeader(
        "Content-Length",
        String(message.attachmentSize),
      );
    }

    // Stream Cloudinary bytes through Express.
    await pipeline(
      Readable.fromWeb(
        upstream.body as Parameters<typeof Readable.fromWeb>[0],
      ),
      res,
    );
  } catch (error) {
    if (res.headersSent) {
      res.destroy(error instanceof Error ? error : undefined);
      return;
    }

    return respondError(error, res);
  }
};

