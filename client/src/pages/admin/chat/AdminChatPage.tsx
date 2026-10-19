import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  RefreshCw,
  Users,
  Search,
  X,
  Settings2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { socket } from "../../../services/socket";
import { useChatSocket } from "../../../features/chat/useChatSocket";
import { useChatReconnect } from "../../../features/chat/useChatReconnect";
import { usePaginatedChatMessages } from "../../../features/chat/usePaginatedChatMessages";
import { useAdminConversationUnreadCounts } from "../../../features/chat/useAdminConversationUnreadCounts";

import ChatNotificationPreferences from "../../../features/chat/components/ChatNotificationPreferences";

import {
  useAdminConversations,
  useMarkChatRead,
} from "../../../features/chat/useChat";

import type {
  ChatMessage,
  ChatMessageEvent,
  ChatReadEvent,
  ChatSocketResponse,
} from "../../../features/chat/chat.types";

import ChatMessageBubble from "../../../features/chat/components/ChatMessageBubble";
import ChatMessageInput from "../../../features/chat/components/ChatMessageInput";
import ChatConversationHeader from "../../../features/chat/components/ChatConversationHeader";
import { uploadChatAttachment } from "../../../features/chat/chatAttachment.api";

type ConversationFilter = "all" | "unread" | "read";

const AdminChatPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { isConnected, error: socketError } = useChatSocket(true);

  // Search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [conversationFilter, setConversationFilter] =
    useState<ConversationFilter>("all");

  // Selected conversation
  const [selectedId, setSelectedId] = useState(
    () => searchParams.get("conversationId") ?? "",
  );

  useEffect(() => {
    setSelectedId(searchParams.get("conversationId") ?? "");
  }, [searchParams]);

  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);

  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollSnapshotRef = useRef<{
    height: number;
    top: number;
    conversationId: string;
  } | null>(null);

  const previousCountRef = useRef(0);
  const previousConversationRef = useRef("");

  // Conversations
  const conversationsQuery = useAdminConversations(1, 100);
  const conversations = conversationsQuery.data?.data ?? [];

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedId,
  );

  const [showNotificationSettings, setShowNotificationSettings] =
    useState(false);

  const notificationSettingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showNotificationSettings) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        notificationSettingsRef.current &&
        !notificationSettingsRef.current.contains(event.target as Node)
      ) {
        setShowNotificationSettings(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowNotificationSettings(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showNotificationSettings]);

  // Unread counts
  const { unreadCounts } = useAdminConversationUnreadCounts(
    conversations.map((conversation) => conversation.id),
  );

  // Sort unread conversations first, then by recent activity
  const sortedConversations = [...conversations].sort((a, b) => {
    const unreadA = unreadCounts[a.id] ?? 0;
    const unreadB = unreadCounts[b.id] ?? 0;

    if (unreadA > 0 !== unreadB > 0) {
      return unreadA > 0 ? -1 : 1;
    }

    return (
      new Date(b.lastMessageAt ?? 0).getTime() -
      new Date(a.lastMessageAt ?? 0).getTime()
    );
  });

  // Search and filter conversations
  const filteredConversations = sortedConversations.filter((conversation) => {
    const search = searchTerm.trim().toLowerCase();

    const customerName = conversation.customer?.name?.toLowerCase() ?? "";

    const customerEmail = conversation.customer?.email?.toLowerCase() ?? "";

    const matchesSearch =
      !search ||
      customerName.includes(search) ||
      customerEmail.includes(search);

    const unreadCount = unreadCounts[conversation.id] ?? 0;

    const matchesFilter =
      conversationFilter === "all" ||
      (conversationFilter === "unread" && unreadCount > 0) ||
      (conversationFilter === "read" && unreadCount === 0);

    return matchesSearch && matchesFilter;
  });

  // Messages
  const messagesQuery = usePaginatedChatMessages(selectedId);
  const markReadMutation = useMarkChatRead();

  const markReadRef = useRef<(conversationId: string) => void>(() => {});

  useEffect(() => {
    markReadRef.current = (conversationId: string) => {
      markReadMutation.mutate(conversationId, {
        onSuccess: () => {
          void Promise.all([
            queryClient.invalidateQueries({
              queryKey: ["chat", "conversations"],
            }),
            queryClient.invalidateQueries({
              queryKey: ["chat", "unread"],
            }),
          ]);
        },
        onError: (error) => {
          console.error("Unable to mark conversation as read:", error);
        },
      });
    };
  }, [markReadMutation, queryClient]);

  useChatReconnect({
    isConnected,
    conversationId: selectedId,
  });

  // Reset state when switching conversations
  useEffect(() => {
    setLiveMessages([]);
    setChatError(null);
    scrollSnapshotRef.current = null;
    previousCountRef.current = 0;
  }, [selectedId]);

  // Socket events
  useEffect(() => {
    if (!selectedId || !isConnected) return;

    let active = true;

    socket.emit(
      "chat:join",
      { conversationId: selectedId },
      (response: ChatSocketResponse) => {
        if (!active) return;

        if (!response.success) {
          setChatError(response.message ?? "Unable to join conversation");
          return;
        }

        setChatError(null);

        void queryClient.invalidateQueries({
          queryKey: ["chat", "messages", selectedId],
        });

        markReadRef.current(selectedId);
      },
    );

    const handleMessage = (event: ChatMessageEvent) => {
      if (event.conversationId !== selectedId) return;

      setLiveMessages((current) => {
        if (current.some((item) => item.id === event.message.id)) {
          return current;
        }

        return [...current, event.message];
      });

      if (event.message.sender?.role === "USER") {
        markReadRef.current(selectedId);
      }

      void queryClient.invalidateQueries({
        queryKey: ["chat", "conversations"],
      });
    };

    const handleRead = (event: ChatReadEvent) => {
      if (event.conversationId !== selectedId) return;

      void queryClient.invalidateQueries({
        queryKey: ["chat", "messages", selectedId],
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
          conversationId: selectedId,
        });
      }
    };
  }, [selectedId, isConnected, queryClient]);

  // Send message
  const handleSend = async (message: string) => {
    if (!selectedId || !socket.connected) {
      throw new Error("Chat is offline. Please reconnect.");
    }

    const conversationId = selectedId;

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

            if (selectedIdRef.current === conversationId) {
              setLiveMessages((current) => {
                if (current.some((item) => item.id === savedMessage.id)) {
                  return current;
                }

                return [...current, savedMessage];
              });
            }

            void queryClient.invalidateQueries({
              queryKey: ["chat", "conversations"],
            });

            resolve();
          },
        );
    });
  };

  // Send image or file attachment
  const handleSendAttachment = async (file: File, caption: string) => {
    if (!selectedId || !socket.connected) {
      throw new Error("Chat is offline. Please reconnect.");
    }

    const conversationId = selectedId;

    const savedMessage = await uploadChatAttachment(
      conversationId,
      file,
      caption,
    );

    // Add the attachment immediately to the active conversation.
    // The socket listener also receives it, so prevent duplicates.
    if (selectedIdRef.current === conversationId) {
      setLiveMessages((current) => {
        if (current.some((item) => item.id === savedMessage.id)) {
          return current;
        }

        return [...current, savedMessage];
      });
    }

    // Refresh saved messages and conversation ordering.
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", conversationId],
      }),
      queryClient.invalidateQueries({
        queryKey: ["chat", "conversations"],
      }),
    ]);
  };

  // Merge paginated and live messages
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

  // Load older messages while preserving scroll position
  const handleLoadOlder = () => {
    const container = containerRef.current;
    if (!container) return;

    const started = messagesQuery.loadOlder();
    if (!started) return;

    scrollSnapshotRef.current = {
      height: container.scrollHeight,
      top: container.scrollTop,
      conversationId: selectedId,
    };
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !selectedId) return;

    const switched = previousConversationRef.current !== selectedId;

    if (switched) {
      previousConversationRef.current = selectedId;
      previousCountRef.current = 0;
      scrollSnapshotRef.current = null;
    }

    const snapshot = scrollSnapshotRef.current;

    if (snapshot?.conversationId === selectedId) {
      if (messagesQuery.isFetchingNextPage) return;

      container.scrollTop =
        snapshot.top + container.scrollHeight - snapshot.height;

      scrollSnapshotRef.current = null;
    } else if (messages.length > previousCountRef.current) {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      if (
        switched ||
        previousCountRef.current === 0 ||
        distanceFromBottom < 150
      ) {
        bottomRef.current?.scrollIntoView({
          behavior: "instant",
          block: "end",
        });
      }
    }

    previousCountRef.current = messages.length;
  }, [selectedId, messages.length, messagesQuery.isFetchingNextPage]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Chat</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customer support conversations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Settings */}
          <div ref={notificationSettingsRef} className="relative">
            <button
              type="button"
              onClick={() =>
                setShowNotificationSettings((previous) => !previous)
              }
              aria-label="Notification settings"
              aria-expanded={showNotificationSettings}
              aria-haspopup="dialog"
              title="Notification settings"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                showNotificationSettings
                  ? "border-blue-200 bg-blue-50 text-blue-600"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Settings2 size={19} />
            </button>

            {showNotificationSettings && (
              <div
                role="dialog"
                aria-label="Chat notification settings"
                className="absolute right-0 top-full z-50 mt-2 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
              >
                <ChatNotificationPreferences />
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => void conversationsQuery.refetch()}
            disabled={conversationsQuery.isFetching}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={conversationsQuery.isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="grid h-[calc(100dvh-13rem)] min-h-[480px] overflow-hidden rounded-xl border border-gray-200 bg-white md:grid-cols-[280px_minmax(0,1fr)]">
        {/* Conversation Sidebar */}
        <aside className="flex min-h-0 flex-col border-b border-gray-200 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2 border-b border-gray-100 p-4">
            <Users size={18} />
            <h2 className="font-semibold">Conversations</h2>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3 border-b border-gray-100 p-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search customers..."
                aria-label="Search customers"
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-9 text-sm outline-none focus:border-blue-500"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-100 p-1">
              {(["all", "unread", "read"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setConversationFilter(filter)}
                  aria-pressed={conversationFilter === filter}
                  className={`rounded-md px-2 py-1.5 text-xs font-medium capitalize transition ${
                    conversationFilter === filter
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Result Count */}
            <p className="text-xs text-gray-500">
              {filteredConversations.length} of {conversations.length}{" "}
              conversations
            </p>
          </div>

          {/* Conversation List */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {conversationsQuery.isLoading ? (
              <p className="p-5 text-sm text-gray-500">
                Loading conversations...
              </p>
            ) : conversationsQuery.isError ? (
              <p className="p-5 text-sm text-red-600">
                Unable to load conversations.
              </p>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                <MessageSquare size={28} className="mx-auto mb-3" />
                No conversations yet.
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center">
                <Search size={28} className="mx-auto mb-3 text-gray-400" />

                <p className="text-sm font-medium text-gray-700">
                  No matching conversations
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Try another search or filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setConversationFilter("all");
                  }}
                  className="mt-3 text-xs font-medium text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const unreadCount = unreadCounts[conversation.id] ?? 0;

                const isUnread = unreadCount > 0;
                const isSelected = selectedId === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(conversation.id);

                      navigate(
                        `/admin/chat?conversationId=${encodeURIComponent(
                          conversation.id,
                        )}`,
                        { replace: true },
                      );
                    }}
                    className={`w-full border-b border-gray-100 p-4 text-left transition ${
                      isSelected
                        ? "bg-blue-50"
                        : isUnread
                          ? "bg-amber-50 hover:bg-amber-100"
                          : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-sm ${
                          isUnread
                            ? "font-bold text-gray-950"
                            : "font-medium text-gray-900"
                        }`}
                      >
                        {conversation.customer?.name ?? "Customer"}
                      </p>

                      {unreadCount > 0 && (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {conversation.customer?.email ?? ""}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      {conversation.lastMessageAt
                        ? new Date(conversation.lastMessageAt).toLocaleString(
                            "en-NP",
                          )
                        : "No messages yet"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Messages Section */}
        <section className="flex min-h-0 min-w-0 flex-col bg-gray-50">
          {!selectedId ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <MessageSquare size={40} className="mb-4 text-gray-400" />

              <h2 className="font-semibold text-gray-900">
                Select a conversation
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Choose a customer to view and reply to messages.
              </p>
            </div>
          ) : (
            <>
              <ChatConversationHeader
                title={selectedConversation?.customer?.name ?? "Customer"}
                subtitle={selectedConversation?.customer?.email}
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

              {/* Message List */}
              <div
                ref={containerRef}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
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
                  <p className="text-center text-sm text-gray-500">
                    No messages yet. Start the conversation.
                  </p>
                ) : (
                  messages.map((message) => (
                    <ChatMessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={message.sender?.role === "ADMIN"}
                      showSender
                    />
                  ))
                )}

                <div ref={bottomRef} />
              </div>

              {/* Message Input */}
              <ChatMessageInput
                onSend={handleSend}
                onSendAttachment={handleSendAttachment}
                disabled={!isConnected || Boolean(chatError) || !selectedId}
                placeholder="Reply to customer..."
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminChatPage;
