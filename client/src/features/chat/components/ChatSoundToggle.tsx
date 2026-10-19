
import { Volume2, VolumeX } from "lucide-react";
import { useChatSoundPreference } from "../useChatSoundPreference";

const ChatSoundToggle = () => {
  const { soundEnabled, setSoundEnabled } =
    useChatSoundPreference();

  return (
    <button
      type="button"
      onClick={() => setSoundEnabled(!soundEnabled)}
      aria-label={
        soundEnabled
          ? "Mute chat notification sounds"
          : "Enable chat notification sounds"
      }
      aria-pressed={soundEnabled}
      title={
        soundEnabled
          ? "Chat sounds on"
          : "Chat sounds off"
      }
      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
    >
      {soundEnabled ? (
        <Volume2 size={16} />
      ) : (
        <VolumeX size={16} />
      )}

      <span>
        Sound {soundEnabled ? "On" : "Off"}
      </span>
    </button>
  );
};

export default ChatSoundToggle;
