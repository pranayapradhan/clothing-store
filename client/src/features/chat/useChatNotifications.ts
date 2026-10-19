
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { socket } from "../../services/socket";

interface ChatNotification {
  conversationId: string;
  messageId: string;
  senderId: string;
  senderRole: "USER" | "ADMIN";
  preview: string;
  createdAt: string;
}

export const useChatNotifications = (enabled = true) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const handleNotification = (event: ChatNotification) => {
      console.log(
        "ADMIN CHAT NOTIFICATION RECEIVED:",
        event,
      );

      void queryClient.invalidateQueries({
        queryKey: ["chat", "conversations"],
      });

      void queryClient.invalidateQueries({
        queryKey: [
          "chat",
          "messages",
          event.conversationId,
        ],
      });

      void queryClient.invalidateQueries({
        queryKey: [
          "chat",
          "unread",
          event.conversationId,
        ],
      });

      void queryClient.invalidateQueries({
        queryKey: [
          "chat",
          "admin",
          "total-unread",
        ],
      });
    };

    socket.on("chat:notification", handleNotification);

    return () => {
      socket.off("chat:notification", handleNotification);
    };
  }, [enabled, queryClient]);
};
