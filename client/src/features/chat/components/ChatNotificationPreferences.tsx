
import { Bell, Monitor, Volume2 } from "lucide-react";

import {
  useChatNotificationPreferences,
} from "../useChatNotificationPreferences";

import {
  useChatSoundPreference,
} from "../useChatSoundPreference";

import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
} from "../browserNotification";

const ChatNotificationPreferences = () => {
  const { preferences, updatePreferences } =
    useChatNotificationPreferences();

  const { soundEnabled, setSoundEnabled } =
    useChatSoundPreference();

  const browserPermission =
    getBrowserNotificationPermission();

  const handleBrowserChange = async (enabled: boolean) => {
    if (enabled && browserPermission !== "granted") {
      const result = await requestBrowserNotificationPermission();

      if (result !== "granted") return;
    }

    updatePreferences({ browserEnabled: enabled });
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
      <div>
        <h3 className="font-semibold text-gray-900">
          Chat Notification Preferences
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Customize how you receive customer message alerts.
        </p>
      </div>

      <label className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm text-gray-700">
          <Bell size={17} />
          In-app notifications
        </span>

        <input
          type="checkbox"
          checked={preferences.toastEnabled}
          onChange={(event) =>
            updatePreferences({
              toastEnabled: event.target.checked,
            })
          }
          className="h-4 w-4 accent-blue-600"
        />
      </label>

      <label className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm text-gray-700">
          <Volume2 size={17} />
          Notification sounds
        </span>

        <input
          type="checkbox"
          checked={soundEnabled}
          onChange={(event) =>
            setSoundEnabled(event.target.checked)
          }
          className="h-4 w-4 accent-blue-600"
        />
      </label>

      <label className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm text-gray-700">
          <Monitor size={17} />
          Browser notifications
        </span>

        <input
          type="checkbox"
          checked={
            preferences.browserEnabled &&
            browserPermission === "granted"
          }
          onChange={(event) => {
            void handleBrowserChange(event.target.checked);
          }}
          disabled={
            browserPermission === "denied" ||
            browserPermission === "unsupported"
          }
          className="h-4 w-4 accent-blue-600"
        />
      </label>

      {browserPermission === "denied" && (
        <p className="text-xs text-amber-700">
          Browser notifications are blocked. Enable them in
          your browser's site settings.
        </p>
      )}
    </div>
  );
};

export default ChatNotificationPreferences;
