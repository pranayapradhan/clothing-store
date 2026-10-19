
import { useQueries } from "@tanstack/react-query";
import { chatService } from "./chat.service";

export const useAdminConversationUnreadCounts = (
  conversationIds: string[],
) => {
  const queries = useQueries({
    queries: conversationIds.map((conversationId) => ({
      queryKey: ["chat", "unread", conversationId],
      queryFn: async () => {
        const response = await chatService.getUnreadCount(conversationId);
        return response.data.unreadCount;
      },
      staleTime: 10_000,
      refetchOnWindowFocus: true,
    })),
  });

  const unreadCounts: Record<string, number> = {};

  conversationIds.forEach((conversationId, index) => {
    unreadCounts[conversationId] = queries[index]?.data ?? 0;
  });

  return {
    unreadCounts,
    isLoading: queries.some((query) => query.isLoading),
  };
};
