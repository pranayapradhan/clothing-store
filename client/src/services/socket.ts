
import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
});

let connectionUsers = 0;

export const connectSocket = () => {
  if (!socket.connected && !socket.active) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export const acquireSocket = () => {
  connectionUsers += 1;

  console.log("Socket acquired:", {
    connectionUsers,
    connected: socket.connected,
    active: socket.active,
  });

  connectSocket();
};

export const releaseSocket = () => {
  connectionUsers = Math.max(0, connectionUsers - 1);

  console.log("Socket released:", {
    connectionUsers,
  });

  if (connectionUsers === 0) {
    disconnectSocket();
  }
};
