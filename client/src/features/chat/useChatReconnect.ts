
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UseChatReconnectOptions {
  enabled?: boolean;
  conversationId?: string;
  isConnected: boolean;
}

export const useChatReconnect = ({
  enabled = true,
  conversationId,
  isConnected,
}: UseChatReconnectOptions) => {
  const queryClient = useQueryClient();
  const hasConnectedBefore = useRef(false);

  useEffect(() => {
    if (!enabled) {
      hasConnectedBefore.current = false;
      return;
    }

    if (!isConnected) return;

    // The first connection already loads data through React Query.
    if (!hasConnectedBefore.current) {
      hasConnectedBefore.current = true;
      return;
    }

    // Refresh the conversation list after reconnecting.
    void queryClient.invalidateQueries({
      queryKey: ["chat", "conversations"],
    });

    // Refresh the customer's conversation information.
    void queryClient.invalidateQueries({
      queryKey: ["chat", "my-conversation"],
    });

    if (conversationId) {
      // Retrieve messages that arrived while disconnected.
      void queryClient.invalidateQueries({
        queryKey: ["chat", "messages", conversationId],
      });

      // Synchronize unread message count.
      void queryClient.invalidateQueries({
        queryKey: ["chat", "unread", conversationId],
      });
    }
  }, [enabled, isConnected, conversationId, queryClient]);
};
