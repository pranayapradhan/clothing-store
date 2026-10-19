
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "admin-chat-sound-enabled";
const EVENT_NAME = "admin-chat-sound-changed";

let cachedValue: string | null = null;
let cachedEnabled = true;

const getSnapshot = (): boolean => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);

    if (value !== cachedValue) {
      cachedValue = value;
      cachedEnabled = value !== "false";
    }

    return cachedEnabled;
  } catch {
    return cachedEnabled;
  }
};

const subscribe = (callback: () => void) => {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
};

export const setChatSoundEnabled = (enabled: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // Storage may be unavailable.
  }

  cachedValue = String(enabled);
  cachedEnabled = enabled;

  window.dispatchEvent(new Event(EVENT_NAME));
};

export const useChatSoundPreference = () => {
  const enabled = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => true,
  );

  return {
    soundEnabled: enabled,
    setSoundEnabled: setChatSoundEnabled,
  };
};
