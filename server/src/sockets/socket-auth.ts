
import type { Socket } from "socket.io";
import * as cookie  from "cookie";
import { User } from "../models/User.js";
import { verifyAccessToken } from "../utils/jwt.js";

export interface SocketUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export const authenticateSocket = async (
  socket: Socket,
  next: (error?: Error) => void,
) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;

    if (!cookieHeader) {
      return next(new Error("Authentication required"));
    }

    const cookies = cookie.parseCookie(cookieHeader);
    const token = cookies.access_token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const payload = verifyAccessToken(token);

    const user = await User.findByPk(payload.userId);

    if (!user || !user.isActive) {
      return next(new Error("Authentication required"));
    }

    socket.data.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    } satisfies SocketUser;

    next();
  } catch {
    next(new Error("Invalid or expired authentication token"));
  }
};
