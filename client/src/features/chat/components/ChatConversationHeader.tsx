
import { Headset, Wifi, WifiOff } from "lucide-react";

interface ChatConversationHeaderProps {
  title: string;
  subtitle?: string;
  isConnected: boolean;
}

const ChatConversationHeader = ({
  title,
  subtitle,
  isConnected,
}: ChatConversationHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
          <Headset size={20} className="text-gray-700" />
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-gray-900">
            {title}
          </h2>

          {subtitle && (
            <p className="truncate text-xs text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div
        className={`flex shrink-0 items-center gap-1.5 text-xs font-medium ${
          isConnected
            ? "text-green-700"
            : "text-gray-500"
        }`}
        title={
          isConnected
            ? "Connected to chat server"
            : "Disconnected from chat server"
        }
      >
        {isConnected ? (
          <Wifi size={15} />
        ) : (
          <WifiOff size={15} />
        )}

        <span className="hidden sm:inline">
          {isConnected ? "Connected" : "Offline"}
        </span>
      </div>
    </div>
  );
};

export default ChatConversationHeader;
