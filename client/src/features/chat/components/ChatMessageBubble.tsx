
import { useEffect, useState } from "react";
import {
  Check,
  CheckCheck,
  Download,
  FileText,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import type { ChatMessage } from "../chat.types";
import {
  getChatAttachmentUrl,
  downloadChatAttachment,
} from "../chatAttachment.api";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showSender?: boolean;
}

const formatSize = (size?: number | null) => {
  if (!size) return "";

  if (size < 1024) return `${size} B`;

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

const ChatMessageBubble = ({
  message,
  isOwnMessage,
  showSender = false,
}: ChatMessageBubbleProps) => {
  const [imageError, setImageError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [message.id]);

  const time = new Date(message.createdAt).toLocaleTimeString(
    "en-NP",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  const hasAttachment = Boolean(
    message.attachmentType && message.attachmentPublicId,
  );

  const isImage = message.attachmentType === "IMAGE";

  const attachmentUrl = hasAttachment
    ? getChatAttachmentUrl(message.id)
    : "";

  const handleDownload = async () => {
    if (!hasAttachment || isDownloading) return;

    setIsDownloading(true);

    try {
      await downloadChatAttachment(
        message.id,
        message.attachmentName || "attachment",
      );

      toast.success("Attachment downloaded");
    } catch (error) {
      console.error("Attachment download failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to download attachment",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-3 shadow-sm sm:max-w-[75%] ${
          isOwnMessage
            ? "rounded-br-md bg-gray-900 text-white"
            : "rounded-bl-md border border-gray-100 bg-white text-gray-900"
        }`}
      >
        {/* Sender name */}
        {showSender && !isOwnMessage && (
          <p className="mb-2 text-xs font-semibold text-blue-600">
            {message.sender?.name ??
              (message.sender?.role === "ADMIN"
                ? "Support"
                : "Customer")}
          </p>
        )}

        {/* Attachment */}
        {hasAttachment && (
          <div className={message.message ? "mb-2" : ""}>
            {/* Image preview */}
            {isImage && !imageError ? (
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-xl"
                aria-label={`Open ${
                  message.attachmentName ?? "photo"
                }`}
              >
                <img
                  src={attachmentUrl}
                  alt={message.attachmentName ?? "Chat photo"}
                  loading="lazy"
                  onError={() => setImageError(true)}
                  className="max-h-80 w-full max-w-sm rounded-xl object-contain"
                />
              </a>
            ) : (
              /* File preview or image fallback */
              <div
                className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 ${
                  isOwnMessage
                    ? "border-white/20 bg-white/10"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                    isOwnMessage
                      ? "bg-white/10"
                      : "bg-white"
                  }`}
                >
                  {isImage ? (
                    <ImageIcon size={22} />
                  ) : (
                    <FileText size={22} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">
                    {message.attachmentName ?? "Attachment"}
                  </p>

                  <p
                    className={`mt-1 text-[11px] ${
                      isOwnMessage
                        ? "text-gray-300"
                        : "text-gray-500"
                    }`}
                  >
                    {formatSize(message.attachmentSize)}
                  </p>
                </div>
              </div>
            )}

            {/* Attachment information for images */}
            {isImage && !imageError && (
              <div className="mt-2 flex items-center justify-between gap-3 px-1">
                <p
                  className={`min-w-0 truncate text-xs ${
                    isOwnMessage
                      ? "text-gray-300"
                      : "text-gray-500"
                  }`}
                  title={message.attachmentName ?? ""}
                >
                  {message.attachmentName ?? "Photo"}
                </p>

                <span
                  className={`shrink-0 text-[11px] ${
                    isOwnMessage
                      ? "text-gray-400"
                      : "text-gray-400"
                  }`}
                >
                  {formatSize(message.attachmentSize)}
                </span>
              </div>
            )}

            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isOwnMessage
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {isDownloading ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Download size={15} />
              )}

              {isDownloading
                ? "Downloading..."
                : "Download"}
            </button>
          </div>
        )}

        {/* Message text or attachment caption */}
        {Boolean(message.message?.trim()) && (
          <p className="whitespace-pre-wrap break-words px-1 text-sm leading-relaxed">
            {message.message}
          </p>
        )}

        {/* Timestamp and read receipt */}
        <div
          className={`mt-2 flex items-center justify-end gap-1 text-[11px] ${
            isOwnMessage
              ? "text-gray-300"
              : "text-gray-400"
          }`}
        >
          <span>{time}</span>

          {isOwnMessage &&
            (message.readAt ? (
              <CheckCheck size={14} />
            ) : (
              <Check size={14} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
