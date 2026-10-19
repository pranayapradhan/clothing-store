
import { api } from "../../services/api";
import type { ChatMessage } from "./chat.types";

interface ChatAttachmentResponse {
  success: boolean;
  message?: string;
  data: ChatMessage;
}

export const uploadChatAttachment = async (
  conversationId: string,
  file: File,
  message = "",
): Promise<ChatMessage> => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("message", message);

  const response = await api.post<ChatAttachmentResponse>(
    `/chat/conversations/${encodeURIComponent(conversationId)}/attachments`,
    formData,
    {
      headers: {
        "Content-Type": undefined,
      },
    },
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(
      response.data.message ?? "Unable to upload attachment",
    );
  }

  return response.data.data;
};

export const getChatAttachmentUrl = (messageId: string) =>
  `${api.defaults.baseURL}/chat/attachments/${encodeURIComponent(messageId)}/download`;



export const downloadChatAttachment = async (
  messageId: string,
  filename: string,
): Promise<void> => {
  const response = await api.get(
    `/chat/attachments/${encodeURIComponent(messageId)}/download`,
    {
      responseType: "blob",
    },
  );

  const blob = response.data as Blob;
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = filename || "attachment";

  document.body.appendChild(link);
  link.click();
  link.remove();

  // Allow the browser to initiate the download before cleanup.
  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
};

