import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chatService } from "./chat.service";

export const chatQueryKeys = {
  all: ["chat"] as const,

  myConversation: ["chat", "my-conversation"] as const,

  conversations: (page: number, limit: number) =>
    ["chat", "conversations", page, limit] as const,

  messages: (conversationId: string, page: number, limit: number) =>
    ["chat", "messages", conversationId, page, limit] as const,

  unread: (conversationId: string) =>
    ["chat", "unread", conversationId] as const,
};

export const useMyConversation = (enabled = true) => {
  return useQuery({
    queryKey: chatQueryKeys.myConversation,
    queryFn: chatService.getMyConversation,
    enabled,
    staleTime: 30 * 1000,
  });
};

export const useAdminConversations = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: chatQueryKeys.conversations(page, limit),
    queryFn: () => chatService.getAdminConversations(page, limit),
    staleTime: 15 * 1000,
  });
};

export const useChatMessages = (
  conversationId: string,
  page = 1,
  limit = 30,
) => {
  return useQuery({
    queryKey: chatQueryKeys.messages(conversationId, page, limit),
    queryFn: () => chatService.getMessages(conversationId, page, limit),
    enabled: Boolean(conversationId),
    staleTime: 10 * 1000,
  });
};

export const useChatUnreadCount = (conversationId: string) => {
  return useQuery({
    queryKey: chatQueryKeys.unread(conversationId),
    queryFn: () => chatService.getUnreadCount(conversationId),
    enabled: Boolean(conversationId),
    staleTime: 10 * 1000,
  });
};

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: string;
    }) => chatService.sendMessage(conversationId, message),

    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["chat", "messages", variables.conversationId],
      });

      void queryClient.invalidateQueries({
        queryKey: ["chat", "conversations"],
      });
    },
  });
};

export const useMarkChatRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      chatService.markRead(conversationId),

    onSuccess: (_data, conversationId) => {
      void queryClient.invalidateQueries({
        queryKey: chatQueryKeys.unread(conversationId),
      });

      void queryClient.invalidateQueries({
        queryKey: ["chat", "admin", "total-unread"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["chat", "messages", conversationId],
      });
    },
  });
};
