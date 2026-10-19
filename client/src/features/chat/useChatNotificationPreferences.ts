
import { useSyncExternalStore } from "react";

export interface ChatNotificationPreferences {
  toastEnabled: boolean;
  browserEnabled: boolean;
}

const STORAGE_KEY = "admin-chat-notification-preferences";
const EVENT_NAME = "admin-chat-notification-preferences-changed";

const DEFAULT_PREFERENCES: ChatNotificationPreferences = {
  toastEnabled: true,
  browserEnabled: true,
};

let cachedRaw: string | null = null;
let cachedPreferences = DEFAULT_PREFERENCES;

const getSnapshot = (): ChatNotificationPreferences => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw !== cachedRaw) {
      cachedRaw = raw;

      if (raw) {
        const parsed: unknown = JSON.parse(raw);

        if (parsed && typeof parsed === "object") {
          const values = parsed as Record<string, unknown>;

          cachedPreferences = {
            toastEnabled:
              typeof values.toastEnabled === "boolean"
                ? values.toastEnabled
                : true,
            browserEnabled:
              typeof values.browserEnabled === "boolean"
                ? values.browserEnabled
                : true,
          };
        } else {
          cachedPreferences = DEFAULT_PREFERENCES;
        }
      } else {
        cachedPreferences = DEFAULT_PREFERENCES;
      }
    }
  } catch {
    cachedPreferences = DEFAULT_PREFERENCES;
  }

  return cachedPreferences;
};

const subscribe = (callback: () => void) => {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
};

export const updateChatNotificationPreferences = (
  updates: Partial<ChatNotificationPreferences>,
) => {
  const next = {
    ...getSnapshot(),
    ...updates,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable.
  }

  cachedRaw = JSON.stringify(next);
  cachedPreferences = next;

  window.dispatchEvent(new Event(EVENT_NAME));
};

export const useChatNotificationPreferences = () => {
  const preferences = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => DEFAULT_PREFERENCES,
  );

  return {
    preferences,
    updatePreferences: updateChatNotificationPreferences,
  };
};
