import { api } from "../../services/api";

import type {
  ChatConversationResponse,
  ChatConversationsResponse,
  ChatMessagesResponse,
  ChatMessageResponse,
  ChatReadResponse,
  ChatUnreadResponse,
} from "./chat.types";

export const chatService = {
  getMyConversation: async (): Promise<ChatConversationResponse> => {
    const response = await api.get<ChatConversationResponse>(
      "/chat/my-conversation",
    );

    return response.data;
  },

  getAdminConversations: async (
    page = 1,
    limit = 20,
  ): Promise<ChatConversationsResponse> => {
    const response = await api.get<ChatConversationsResponse>(
      "/chat/admin/conversations",
      {
        params: { page, limit },
      },
    );

    return response.data;
  },

  getMessages: async (
    conversationId: string,
    page = 1,
    limit = 30,
  ): Promise<ChatMessagesResponse> => {
    const response = await api.get<ChatMessagesResponse>(
      `/chat/conversations/${conversationId}/messages`,
      {
        params: { page, limit },
      },
    );

    return response.data;
  },

  sendMessage: async (
    conversationId: string,
    message: string,
  ): Promise<ChatMessageResponse> => {
    const response = await api.post<ChatMessageResponse>(
      `/chat/conversations/${conversationId}/messages`,
      { message },
    );

    return response.data;
  },

  markRead: async (conversationId: string): Promise<ChatReadResponse> => {
    const response = await api.patch<ChatReadResponse>(
      `/chat/conversations/${conversationId}/read`,
    );

    return response.data;
  },

  getUnreadCount: async (
    conversationId: string,
  ): Promise<ChatUnreadResponse> => {
    const response = await api.get<ChatUnreadResponse>(
      `/chat/conversations/${conversationId}/unread`,
    );

    return response.data;
  },

  getAdminTotalUnreadCount: async () => {
    const response = await api.get<{
      success: boolean;
      data: {
        unreadCount: number;
      };
    }>("/chat/admin/unread-count");

    return response.data;
  },
};
