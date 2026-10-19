
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { chatService } from "./chat.service";
import type { ChatMessage } from "./chat.types";

const PAGE_SIZE = 30;

export const usePaginatedChatMessages = (
  conversationId: string,
) => {
  const query = useInfiniteQuery({
    queryKey: ["chat", "messages", conversationId],

    queryFn: ({ pageParam }) =>
      chatService.getMessages(
        conversationId,
        pageParam,
        PAGE_SIZE,
      ),

    initialPageParam: 1,

    getNextPageParam: (lastPage, allPages) => {
      const { pagination } = lastPage;

      if (pagination.page >= pagination.totalPages) {
        return undefined;
      }

      return allPages.length + 1;
    },

    enabled: Boolean(conversationId),
    staleTime: 10 * 1000,
  });

  const messages = useMemo<ChatMessage[]>(() => {
    const pages = query.data?.pages ?? [];

    const allMessages = pages.flatMap(
      (page) => page.data,
    );

    return Array.from(
      new Map(
        allMessages.map((message) => [
          message.id,
          message,
        ]),
      ).values(),
    ).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    );
  }, [query.data]);

  const loadOlder = (): boolean => {
    if (
      !conversationId ||
      !query.hasNextPage ||
      query.isFetchingNextPage
    ) {
      return false;
    }

    void query.fetchNextPage();

    return true;
  };

  return {
    ...query,
    messages,
    hasMore: query.hasNextPage,
    loadOlder,
  };
};
