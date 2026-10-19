
import { useQuery } from "@tanstack/react-query";
import { chatService } from "./chat.service";

export const useAdminUnreadCount = () => {
  return useQuery({
    queryKey: ["chat", "admin", "total-unread"],

    queryFn: async () => {
      const response =
        await chatService.getAdminTotalUnreadCount();

      return response.data.unreadCount;
    },

    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
};
