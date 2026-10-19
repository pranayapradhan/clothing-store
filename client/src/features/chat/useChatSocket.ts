
import { useEffect, useState } from "react";
import {
  socket,
  acquireSocket,
  releaseSocket,
} from "../../services/socket";

export const useChatSocket = (enabled = true) => {
  const [isConnected, setIsConnected] = useState(
    enabled && socket.connected,
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsConnected(false);
      return;
    }

    const handleConnect = () => {
      console.log("SOCKET CONNECTED:", socket.id);
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = (reason: string) => {
      console.warn("SOCKET DISCONNECTED:", reason);
      setIsConnected(false);
    };

    const handleConnectError = (err: Error) => {
      console.error("SOCKET CONNECTION ERROR:", err.message);
      setIsConnected(false);
      setError(err.message || "Socket connection failed");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    acquireSocket();

    setIsConnected(socket.connected);

    if (socket.connected) {
      console.log("SOCKET ALREADY CONNECTED:", socket.id);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      releaseSocket();
    };
  }, [enabled]);

  return {
    isConnected,
    error,
  };
};
