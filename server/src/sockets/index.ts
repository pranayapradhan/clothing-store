import type { Server, Socket } from "socket.io";

import { authenticateSocket } from "./socket-auth.js";
import {
  getConversationForUser,
  sendChatMessage,
  markConversationMessagesRead,
} from "../services/chat.service.js";

type ChatRole = "USER" | "ADMIN";

interface SocketUser {
  id: string;
  name: string;
  email: string;
  role: ChatRole;
}

interface ChatPayload {
  conversationId: string;
}

interface SendMessagePayload extends ChatPayload {
  message: string;
}

interface SocketResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

interface ChatNotificationEvent {
  conversationId: string;
  messageId: string;
  senderId: string;
  senderRole: ChatRole;
  preview: string;
  createdAt: string;
}

type Acknowledgement<T = unknown> = (response: SocketResponse<T>) => void;

const isValidUUID = (value: unknown): value is string => {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
};

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error
    ? error.message
    : "An unexpected chat error occurred";
};

export const setupSocket = (io: Server): void => {
  io.use(authenticateSocket);

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user as SocketUser;
    console.log("SOCKET CONNECTED:", {
      socketId: socket.id,
      userId: user.id,
      role: user.role,
    });

    // Personal room for each authenticated user
    socket.join(`user:${user.id}`);

    // Shared room for all authenticated admins
    if (user.role === "ADMIN") {
      socket.join("role:ADMIN");
    }

    socket.emit("chat:connected", {
      userId: user.id,
      role: user.role,
    });

    // Join an authorized conversation
    socket.on(
      "chat:join",
      async (
        payload: ChatPayload,
        ack?: Acknowledgement<{ conversationId: string }>,
      ) => {
        try {
          const conversationId = payload?.conversationId;

          if (!isValidUUID(conversationId)) {
            ack?.({
              success: false,
              message: "Invalid conversation ID",
            });
            return;
          }

          await getConversationForUser(conversationId, user.id, user.role);

          await socket.join(`conversation:${conversationId}`);

          ack?.({
            success: true,
            data: { conversationId },
          });
        } catch (error) {
          ack?.({
            success: false,
            message: getErrorMessage(error),
          });
        }
      },
    );

    // Leave a conversation
    socket.on(
      "chat:leave",
      (
        payload: ChatPayload,
        ack?: Acknowledgement<{ conversationId: string }>,
      ) => {
        const conversationId = payload?.conversationId;

        if (!isValidUUID(conversationId)) {
          ack?.({
            success: false,
            message: "Invalid conversation ID",
          });
          return;
        }

        socket.leave(`conversation:${conversationId}`);

        ack?.({
          success: true,
          data: { conversationId },
        });
      },
    );

    // Send a message
    socket.on(
      "chat:send",
      async (payload: SendMessagePayload, ack?: Acknowledgement) => {
        try {
          const conversationId = payload?.conversationId;
          const message = payload?.message;

          if (!isValidUUID(conversationId)) {
            ack?.({
              success: false,
              message: "Invalid conversation ID",
            });
            return;
          }

          if (
            typeof message !== "string" ||
            !message.trim() ||
            message.trim().length > 5000
          ) {
            ack?.({
              success: false,
              message: "Message must contain 1 to 5000 characters",
            });
            return;
          }

          // Authorization and conversation ownership
          const conversation = await getConversationForUser(
            conversationId,
            user.id,
            user.role,
          );

          // Save message in PostgreSQL
          const savedMessage = await sendChatMessage(
            conversationId,
            user.id,
            user.role,
            message.trim(),
          );

          if (!savedMessage) {
            ack?.({
              success: false,
              message: "Failed to save chat message",
            });
            return;
          }

          // Broadcast to users viewing this conversation
          io.to(`conversation:${conversationId}`).emit("chat:message", {
            conversationId,
            message: savedMessage,
          });

          // Also deliver to sender's personal room
          io.to(`user:${user.id}`).emit("chat:message", {
            conversationId,
            message: savedMessage,
          });

          // Notification for conversation lists / unread badges
          const notification: ChatNotificationEvent = {
            conversationId,
            messageId: savedMessage.id,
            senderId: savedMessage.senderId,
            senderRole: user.role,
            preview: savedMessage.message.slice(0, 120),
            createdAt: new Date(savedMessage.createdAt).toISOString(),
          };

          if (user.role === "USER") {
            const adminRoom = io.sockets.adapter.rooms.get("role:ADMIN");

            // console.log("SENDING ADMIN NOTIFICATION:", {
            //   conversationId,
            //   messageId: notification.messageId,
            //   connectedAdminSockets: adminRoom?.size ?? 0,
            // });

            io.to("role:ADMIN").emit("chat:notification", notification);
          } else {
            // Notify the customer, even if not viewing the chat
            io.to(`user:${conversation.customerId}`).emit(
              "chat:notification",
              notification,
            );
          }

          ack?.({
            success: true,
            data: savedMessage,
          });
        } catch (error) {
          ack?.({
            success: false,
            message: getErrorMessage(error),
          });
        }
      },
    );

    // Mark incoming messages as read
    socket.on(
      "chat:read",
      async (
        payload: ChatPayload,
        ack?: Acknowledgement<{ updatedCount: number }>,
      ) => {
        try {
          const conversationId = payload?.conversationId;

          if (!isValidUUID(conversationId)) {
            ack?.({
              success: false,
              message: "Invalid conversation ID",
            });
            return;
          }

          await getConversationForUser(conversationId, user.id, user.role);

          const updatedCount = await markConversationMessagesRead(
            conversationId,
            user.id,
            user.role,
          );

          io.to(`conversation:${conversationId}`).emit("chat:read", {
            conversationId,
            readerId: user.id,
            updatedCount,
          });

          ack?.({
            success: true,
            data: { updatedCount },
          });
        } catch (error) {
          ack?.({
            success: false,
            message: getErrorMessage(error),
          });
        }
      },
    );

    socket.on("disconnect", (reason: string) => {
      console.log(`Socket disconnected: ${user.email} (${reason})`);
    });
  });
};
