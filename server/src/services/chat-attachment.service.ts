
import { Readable } from "node:stream";
import { fileTypeFromBuffer } from "file-type";
import type { Express } from "express";

import cloudinary from "../config/cloudinary.js";
import { ChatMessage, Conversation, User } from "../models/index.js";
import {
  ChatServiceError,
  getConversationForUser,
} from "./chat.service.js";
import crypto from "node:crypto";

const MAX_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

const detectAttachmentType = async (
  file: Express.Multer.File,
) => {
  const detected = await fileTypeFromBuffer(file.buffer);

  // The client-provided MIME type is not trusted.
  if (!detected || !ALLOWED_TYPES.has(detected.mime)) {
    throw new ChatServiceError(
      "Unsupported or unrecognized file type",
      400,
    );
  }

  if (detected.mime !== file.mimetype) {
    throw new ChatServiceError(
      "File content does not match its declared type",
      400,
    );
  }

  // Legacy DOC detection may require additional validation.
  // This implementation accepts only confidently detected formats.
  return detected.mime;
};

const uploadToCloudinary = async (
  file: Express.Multer.File,
  mimeType: string,
  conversationId: string,
) => {
  const isImage = mimeType.startsWith("image/");

  const extension = EXTENSIONS[mimeType];

  const publicId = crypto.randomUUID();

  const resourceType = isImage ? "image" : "raw";

  const result = await new Promise<{
    public_id: string;
    secure_url: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `chat-attachments/${conversationId}`,
        public_id: isImage
          ? publicId
          : `${publicId}.${extension}`,
        resource_type: resourceType,
        type: "authenticated",
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
        });
      },
    );

    Readable.from(file.buffer).pipe(stream);
  });

  return {
    ...result,
    resourceType,
  };
};

export const createChatAttachmentMessage = async ({
  conversationId,
  senderId,
  role,
  file,
  caption,
}: {
  conversationId: string;
  senderId: string;
  role: "USER" | "ADMIN";
  file: Express.Multer.File;
  caption: string;
}) => {
  await getConversationForUser(conversationId, senderId, role);

  if (!file.buffer?.length || file.size > MAX_SIZE) {
    throw new ChatServiceError(
      "File must be between 1 byte and 10 MB",
      400,
    );
  }

  if (caption.length > 5000) {
    throw new ChatServiceError(
      "Caption must not exceed 5000 characters",
      400,
    );
  }

  const mimeType = await detectAttachmentType(file);
  const attachmentType = mimeType.startsWith("image/")
    ? "IMAGE"
    : "FILE";

  const uploaded = await uploadToCloudinary(
    file,
    mimeType,
    conversationId,
  );

  try {
    const savedMessage = await ChatMessage.create({
      conversationId,
      senderId,
      message: caption.trim(),
      attachmentType,
      attachmentName: file.originalname.slice(0, 255),
      attachmentUrl: null,
      attachmentPublicId: uploaded.public_id,
      attachmentMimeType: mimeType,
      attachmentSize: file.size,
    });

    await Conversation.update(
      { lastMessageAt: savedMessage.createdAt },
      { where: { id: conversationId } },
    );

    const message = await ChatMessage.findByPk(savedMessage.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "role"],
        },
      ],
    });

    if (!message) {
      throw new Error("Unable to retrieve saved attachment message");
    }

    return message;
  } catch (error) {
    await cloudinary.uploader
      .destroy(uploaded.public_id, {
        resource_type: uploaded.resourceType,
        type: "authenticated",
      })
      .catch(console.error);

    throw error;
  }
};

export const getChatAttachmentDownloadUrl = async ({
  messageId,
  userId,
  role,
}: {
  messageId: string;
  userId: string;
  role: "USER" | "ADMIN";
}) => {
  const message = await ChatMessage.findByPk(messageId);

  if (!message || !message.attachmentPublicId) {
    throw new ChatServiceError("Attachment not found", 404);
  }

  await getConversationForUser(
    message.conversationId,
    userId,
    role,
  );

  const isImage = message.attachmentType === "IMAGE";

  const resourceType = isImage ? "image" : "raw";

  // Signed Cloudinary URL, valid for five minutes.
  const expiresAt = Math.floor(Date.now() / 1000) + 300;

  const extension = isImage
    ? EXTENSIONS[message.attachmentMimeType ?? ""] ?? "jpg"
    : "";

  return cloudinary.utils.private_download_url(
    message.attachmentPublicId,
    extension,
    {
      resource_type: resourceType,
      type: "authenticated",
      expires_at: expiresAt,
      attachment: !isImage,
    },
  );
};
