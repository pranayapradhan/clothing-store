
import { useState } from "react";
import { Bell, BellOff } from "lucide-react";

import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
} from "../browserNotification";

const BrowserNotificationToggle = () => {
  const [permission, setPermission] = useState(
    getBrowserNotificationPermission,
  );

  const handleClick = async () => {
    if (permission === "granted") {
      return;
    }

    const result = await requestBrowserNotificationPermission();
    setPermission(result);
  };

  const enabled = permission === "granted";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={
        permission === "denied" ||
        permission === "unsupported" ||
        enabled
      }
      title={
        permission === "denied"
          ? "Enable notifications in browser settings"
          : permission === "unsupported"
            ? "Browser notifications unavailable"
            : enabled
              ? "Browser notifications enabled"
              : "Enable browser notifications"
      }
      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {enabled ? <Bell size={16} /> : <BellOff size={16} />}

      <span>
        {enabled ? "Alerts On" : "Enable Alerts"}
      </span>
    </button>
  );
};

export default BrowserNotificationToggle;
