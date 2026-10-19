
import { useChatUnreadCount } from "../useChat";

interface ChatUnreadBadgeProps {
  conversationId: string;
}

const ChatUnreadBadge = ({
  conversationId,
}: ChatUnreadBadgeProps) => {
  const { data, isLoading, isError } =
    useChatUnreadCount(conversationId);

  if (isLoading || isError) {
    return null;
  }

  const unreadCount = data?.data?.unreadCount ?? 0;

  if (unreadCount <= 0) {
    return null;
  }

  return (
    <span
      className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white"
      aria-label={`${unreadCount} unread messages`}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
};

export default ChatUnreadBadge;
