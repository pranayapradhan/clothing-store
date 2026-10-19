
import multer from "multer";

export const MAX_CHAT_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export const chatAttachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_CHAT_ATTACHMENT_SIZE,
    files: 1,
    fields: 1,
    fieldSize: 5000,
  },
}).single("file");
