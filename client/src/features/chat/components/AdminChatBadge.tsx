
import { useAdminUnreadCount } from "../useAdminUnreadCount";

const AdminChatBadge = () => {
  const { data: unreadCount = 0 } = useAdminUnreadCount();

  if (unreadCount <= 0) return null;

  return (
    <span
      aria-label={`${unreadCount} unread chat messages`}
      className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white"
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
};

export default AdminChatBadge;
