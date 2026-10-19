
export const isBrowserNotificationSupported = (): boolean => {
  return typeof window !== "undefined" && "Notification" in window;
};

export const getBrowserNotificationPermission =
  (): NotificationPermission | "unsupported" => {
    if (!isBrowserNotificationSupported()) {
      return "unsupported";
    }

    return Notification.permission;
  };

export const requestBrowserNotificationPermission =
  async (): Promise<NotificationPermission | "unsupported"> => {
    if (!isBrowserNotificationSupported()) {
      return "unsupported";
    }

    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  };

interface ShowBrowserNotificationOptions {
  title: string;
  body: string;
  onClick?: () => void;
}

export const showBrowserNotification = ({
  title,
  body,
  onClick,
}: ShowBrowserNotificationOptions): void => {
  if (!isBrowserNotificationSupported()) return;
  if (Notification.permission !== "granted") return;

  try {
    const notification = new Notification(title, {
      body,
      tag: "admin-chat-message",
    });

    notification.onclick = () => {
      window.focus();
      onClick?.();
      notification.close();
    };
  } catch {
    // Browser may restrict notifications.
  }
};
