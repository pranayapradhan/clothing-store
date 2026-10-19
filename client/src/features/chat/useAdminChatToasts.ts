
import { useEffect } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { toast } from "sonner";

import { socket } from "../../services/socket";
import { playChatNotificationSound } from "./chatSound";
import { useChatSoundPreference } from "./useChatSoundPreference";
import { showBrowserNotification } from "./browserNotification";
import { useChatNotificationPreferences } from "./useChatNotificationPreferences";

interface ChatNotification {
  conversationId: string;
  messageId: string;
  senderId: string;
  senderRole: "USER" | "ADMIN";
  preview: string;
  createdAt: string;
}

export const useAdminChatToasts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const { soundEnabled } = useChatSoundPreference();

  const { preferences } = useChatNotificationPreferences();

  const activeConversationId =
    location.pathname === "/admin/chat"
      ? searchParams.get("conversationId")
      : null;

  useEffect(() => {
    const handleNotification = (event: ChatNotification) => {
      // Only notify admins about incoming customer messages.
      if (event.senderRole !== "USER") return;

      // Suppress alerts for the currently open conversation
      // while the admin is actively viewing the tab.
      if (
        document.visibilityState === "visible" &&
        location.pathname === "/admin/chat" &&
        activeConversationId === event.conversationId
      ) {
        return;
      }

      const openConversation = () => {
        navigate(
          `/admin/chat?conversationId=${encodeURIComponent(
            event.conversationId,
          )}`,
        );
      };

      // Browser notifications: only when tab is hidden.
      if (
        preferences.browserEnabled &&
        document.visibilityState === "hidden"
      ) {
        showBrowserNotification({
          title: "New customer message",
          body: event.preview,
          onClick: openConversation,
        });
      }

      // Sound notifications.
      if (soundEnabled) {
        playChatNotificationSound();
      }

      // In-app toast notifications.
      if (preferences.toastEnabled) {
        toast.message("New customer message", {
          id: `chat-${event.messageId}`,
          description: event.preview,
          duration: 6000,
          action: {
            label: "Open chat",
            onClick: openConversation,
          },
        });
      }
    };

    socket.on("chat:notification", handleNotification);

    return () => {
      socket.off("chat:notification", handleNotification);
    };
  }, [
    navigate,
    location.pathname,
    activeConversationId,
    soundEnabled,
    preferences.toastEnabled,
    preferences.browserEnabled,
  ]);
};
