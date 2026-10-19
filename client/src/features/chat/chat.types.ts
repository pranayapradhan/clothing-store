
export type ChatRole = "USER" | "ADMIN";

export interface ChatUser {
  id: string;
  name: string;
  role: ChatRole;
}

export interface ChatCustomer {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface Conversation {
  id: string;
  customerId: string;
  customer?: ChatCustomer;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: ChatUser;

  message: string;

  attachmentType: "IMAGE" | "FILE" | null;
  attachmentName: string | null;
  attachmentUrl: string | null;
  attachmentPublicId?: string | null;
  attachmentMimeType: string | null;
  attachmentSize: number | null;

  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChatConversationResponse {
  success: boolean;
  data: Conversation;
}

export interface ChatConversationsResponse {
  success: boolean;
  data: Conversation[];
  pagination: ChatPagination;
}

export interface ChatMessagesResponse {
  success: boolean;
  data: ChatMessage[];
  pagination: ChatPagination;
}

export interface ChatMessageResponse {
  success: boolean;
  data: ChatMessage;
}

export interface ChatReadResponse {
  success: boolean;
  data: {
    updatedCount: number;
  };
}

export interface ChatUnreadResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
}

export interface ChatSocketResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ChatMessageEvent {
  conversationId: string;
  message: ChatMessage;
}

export interface ChatReadEvent {
  conversationId: string;
  readerId: string;
  updatedCount: number;
}

export interface ChatAttachment {
  type: "IMAGE" | "FILE";
  name: string;
  url: string;
  mimeType: string;
  size: number;
}