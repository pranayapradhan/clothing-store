
import { useEffect, useRef, useState } from "react";
import type {
  FormEvent,
  KeyboardEvent,
  ChangeEvent,
} from "react";

import {
  Send,
  LoaderCircle,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

interface ChatMessageInputProps {
  onSend: (message: string) => Promise<void>;
  onSendAttachment?: (
    file: File,
    message: string,
  ) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_MESSAGE_LENGTH = 5000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ChatMessageInput = ({
  onSend,
  onSendAttachment,
  disabled = false,
  placeholder = "Type your message...",
}: ChatMessageInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isImage = selectedFile?.type.startsWith("image/") ?? false;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setError("Maximum file size is 10 MB.");
      event.target.value = "";
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError("This file type is not supported.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    event.target.value = "";
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();

    if (
      (!trimmedMessage && !selectedFile) ||
      trimmedMessage.length > MAX_MESSAGE_LENGTH ||
      isSending ||
      disabled
    ) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      if (selectedFile) {
        if (!onSendAttachment) {
          throw new Error("File attachments are not enabled yet.");
        }

        await onSendAttachment(selectedFile, trimmedMessage);
      } else {
        await onSend(trimmedMessage);
      }

      setMessage("");
      setSelectedFile(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send message",
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSend();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white p-3 sm:p-4"
    >
      {error && (
        <p role="alert" className="mb-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {/* Selected Attachment Preview */}
      {selectedFile && (
        <div className="mb-3 flex max-w-sm items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
          {isImage && previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected attachment preview"
              className="h-14 w-14 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white">
              <FileText size={24} className="text-gray-500" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-900">
              {selectedFile.name}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          <button
            type="button"
            onClick={removeFile}
            disabled={isSending}
            aria-label="Remove attachment"
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Select chat attachment"
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isSending || !onSendAttachment}
          title={
            onSendAttachment
              ? "Attach photo or file"
              : "Attachments are not enabled yet"
          }
          aria-label="Attach photo or file"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selectedFile ? (
            <ImageIcon size={19} />
          ) : (
            <Paperclip size={19} />
          )}
        </button>

        {/* Message */}
        <textarea
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={1}
          placeholder={
            selectedFile
              ? "Add a caption (optional)..."
              : placeholder
          }
          aria-label="Chat message"
          className="max-h-36 min-h-11 flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-900 disabled:opacity-50"
        />

        {/* Send */}
        <button
          type="submit"
          disabled={
            disabled ||
            isSending ||
            (!message.trim() && !selectedFile)
          }
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>

      <div className="mt-2 flex justify-between gap-2 text-[11px] text-gray-400">
        <span>
          Enter to send · Shift+Enter for a new line
        </span>
        <span>
          {message.length}/{MAX_MESSAGE_LENGTH}
        </span>
      </div>
    </form>
  );
};

export default ChatMessageInput;
