import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";

import { socket } from "../../services/socket";
import { useChatSocket } from "../../features/chat/useChatSocket";
import { useChatReconnect } from "../../features/chat/useChatReconnect";
import { usePaginatedChatMessages } from "../../features/chat/usePaginatedChatMessages";
import {
  useMyConversation,
  useMarkChatRead,
} from "../../features/chat/useChat";

import type {
  ChatMessage,
  ChatMessageEvent,
  ChatReadEvent,
  ChatSocketResponse,
} from "../../features/chat/chat.types";

import ChatMessageBubble from "../../features/chat/components/ChatMessageBubble";
import ChatMessageInput from "../../features/chat/components/ChatMessageInput";
import ChatConversationHeader from "../../features/chat/components/ChatConversationHeader";
import { uploadChatAttachment } from "../../features/chat/chatAttachment.api";

const CustomerChatPage = () => {
  const queryClient = useQueryClient();

  const { isConnected, error: socketError } = useChatSocket(true);

  const conversationQuery = useMyConversation();
  const conversation = conversationQuery.data?.data;
  const conversationId = conversation?.id ?? "";

  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollSnapshotRef = useRef<{
    height: number;
    top: number;
  } | null>(null);

  const previousCountRef = useRef(0);

  const messagesQuery = usePaginatedChatMessages(conversationId);
  const markReadMutation = useMarkChatRead();
  const markReadRef = useRef(markReadMutation.mutate);

  useEffect(() => {
    markReadRef.current = markReadMutation.mutate;
  }, [markReadMutation.mutate]);

  useChatReconnect({
    isConnected,
    conversationId,
  });

  useEffect(() => {
    if (!conversationId || !isConnected) return;

    let active = true;

    socket.emit(
      "chat:join",
      { conversationId },
      (response: ChatSocketResponse) => {
        if (!active) return;

        if (!response.success) {
          setChatError(response.message ?? "Unable to join conversation");
          return;
        }

        setChatError(null);

        void queryClient.invalidateQueries({
          queryKey: ["chat", "messages", conversationId],
        });

        markReadRef.current(conversationId);
      },
    );

    const handleMessage = (event: ChatMessageEvent) => {
      if (event.conversationId !== conversationId) return;

      setLiveMessages((current) => {
        if (current.some((item) => item.id === event.message.id)) {
          return current;
        }

        return [...current, event.message];
      });

      if (event.message.sender?.role === "ADMIN") {
        markReadRef.current(conversationId);
      }
    };

    const handleRead = (event: ChatReadEvent) => {
      if (event.conversationId !== conversationId) return;

      void queryClient.invalidateQueries({
        queryKey: ["chat", "messages", conversationId],
      });
    };

    socket.on("chat:message", handleMessage);
    socket.on("chat:read", handleRead);

    return () => {
      active = false;

      socket.off("chat:message", handleMessage);
      socket.off("chat:read", handleRead);

      if (socket.connected) {
        socket.emit("chat:leave", {
          conversationId,
        });
      }
    };
  }, [conversationId, isConnected, queryClient]);

  const handleSend = async (message: string) => {
    if (!conversationId || !socket.connected) {
      throw new Error("Chat is offline. Please reconnect.");
    }

    await new Promise<void>((resolve, reject) => {
      socket
        .timeout(10000)
        .emit(
          "chat:send",
          { conversationId, message },
          (error: Error | null, response: ChatSocketResponse<ChatMessage>) => {
            if (error) {
              reject(new Error("Message delivery timed out"));
              return;
            }

            if (!response?.success || !response.data) {
              reject(new Error(response?.message ?? "Unable to send message"));
              return;
            }

            const savedMessage = response.data;

            setLiveMessages((current) => {
              if (current.some((item) => item.id === savedMessage.id)) {
                return current;
              }

              return [...current, savedMessage];
            });

            resolve();
          },
        );
    });
  };

  const handleSendAttachment = async (file: File, caption: string) => {
    if (!conversationId) {
      throw new Error("Conversation is not available.");
    }

    if (!socket.connected) {
      throw new Error("Chat is offline. Please reconnect.");
    }

    const savedMessage = await uploadChatAttachment(
      conversationId,
      file,
      caption,
    );

    setLiveMessages((current) => {
      if (current.some((item) => item.id === savedMessage.id)) {
        return current;
      }

      return [...current, savedMessage];
    });

    void queryClient.invalidateQueries({
      queryKey: ["chat", "messages", conversationId],
    });
  };

  const messages = Array.from(
    new Map(
      [...messagesQuery.messages, ...liveMessages].map((message) => [
        message.id,
        message,
      ]),
    ).values(),
  ).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const handleLoadOlder = () => {
    const container = containerRef.current;
    if (!container) return;

    const started = messagesQuery.loadOlder();
    if (!started) return;

    scrollSnapshotRef.current = {
      height: container.scrollHeight,
      top: container.scrollTop,
    };
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const snapshot = scrollSnapshotRef.current;

    if (snapshot) {
      if (messagesQuery.isFetchingNextPage) return;

      container.scrollTop =
        snapshot.top + container.scrollHeight - snapshot.height;

      scrollSnapshotRef.current = null;
    } else if (messages.length > previousCountRef.current) {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      if (previousCountRef.current === 0 || distanceFromBottom < 150) {
        bottomRef.current?.scrollIntoView({
          behavior: "instant",
          block: "end",
        });
      }
    }

    previousCountRef.current = messages.length;
  }, [messages.length, messagesQuery.isFetchingNextPage]);

  return (
    <div className="mx-auto flex h-[calc(100dvh-12rem)] min-h-[480px] max-w-4xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      <ChatConversationHeader
        title="Customer Support"
        subtitle="Chat with our support team"
        isConnected={isConnected}
      />

      {(socketError || chatError) && (
        <div
          role="alert"
          className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700"
        >
          {chatError || socketError}
        </div>
      )}

      {conversationQuery.isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">Loading conversation...</p>
        </div>
      ) : conversationQuery.isError ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-red-600">Unable to load conversation.</p>
        </div>
      ) : (
        <>
          <div
            ref={containerRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 sm:p-6"
          >
            {messagesQuery.hasMore && (
              <div className="flex justify-center pb-3">
                <button
                  type="button"
                  onClick={handleLoadOlder}
                  disabled={messagesQuery.isFetchingNextPage}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {messagesQuery.isFetchingNextPage
                    ? "Loading..."
                    : "Load older messages"}
                </button>
              </div>
            )}

            {messagesQuery.isLoading ? (
              <p className="text-center text-sm text-gray-500">
                Loading messages...
              </p>
            ) : messagesQuery.isError ? (
              <p className="text-center text-sm text-red-600">
                Unable to load messages.
              </p>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare size={36} className="mb-3 text-gray-400" />
                <p className="font-medium text-gray-800">
                  Start a conversation
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Send a message to our support team.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.sender?.role === "USER"}
                />
              ))
            )}

            <div ref={bottomRef} />
          </div>

          <ChatMessageInput
            onSend={handleSend}
            onSendAttachment={handleSendAttachment}
            disabled={!isConnected || Boolean(chatError)}
            placeholder="Type your message..."
          />
        </>
      )}
    </div>
  );
};

export default CustomerChatPage;
