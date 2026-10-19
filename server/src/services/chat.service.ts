
import { Op } from "sequelize";

import {
  ChatMessage,
  Conversation,
  User,
} from "../models/index.js";

const MAX_MESSAGE_LENGTH = 5000;

export class ChatServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ChatServiceError";
  }
}

export const getOrCreateCustomerConversation = async (
  customerId: string,
) => {
  const customer = await User.findOne({
    where: {
      id: customerId,
      role: "USER",
      isActive: true,
    },
    attributes: ["id"],
  });

  if (!customer) {
    throw new ChatServiceError(
      "Active customer not found",
      404,
    );
  }

  const [conversation] = await Conversation.findOrCreate({
    where: { customerId },
    defaults: { customerId },
  });

  return conversation;
};

export const getConversationForUser = async (
  conversationId: string,
  userId: string,
  role: "USER" | "ADMIN",
) => {
  const conversation = await Conversation.findByPk(
    conversationId,
  );

  if (!conversation) {
    throw new ChatServiceError(
      "Conversation not found",
      404,
    );
  }

  if (
    role !== "ADMIN" &&
    conversation.customerId !== userId
  ) {
    throw new ChatServiceError(
      "You cannot access this conversation",
      403,
    );
  }

  return conversation;
};

export const getCustomerConversations = async (
  page = 1,
  limit = 20,
) => {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(
    100,
    Math.max(1, Math.floor(limit)),
  );

  const { rows, count } =
    await Conversation.findAndCountAll({
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "isActive"],
        },
      ],
      order: [
        ["lastMessageAt", "DESC NULLS LAST"],
        ["createdAt", "DESC"],
      ],
      limit: safeLimit,
      offset: (safePage - 1) * safeLimit,
    });

  return {
    conversations: rows,
    pagination: {
      total: count,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(count / safeLimit),
    },
  };
};

export const getConversationMessages = async (
  conversationId: string,
  userId: string,
  role: "USER" | "ADMIN",
  page = 1,
  limit = 30,
) => {
  await getConversationForUser(
    conversationId,
    userId,
    role,
  );

  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(
    100,
    Math.max(1, Math.floor(limit)),
  );

  const { rows, count } = await ChatMessage.findAndCountAll({
    where: { conversationId },
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["id", "name", "role"],
      },
    ],
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  });

  return {
    messages: rows.reverse(),
    pagination: {
      total: count,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(count / safeLimit),
    },
  };
};

export const sendChatMessage = async (
  conversationId: string,
  senderId: string,
  role: "USER" | "ADMIN",
  content: string,
) => {
  await getConversationForUser(
    conversationId,
    senderId,
    role,
  );

  if (typeof content !== "string") {
    throw new ChatServiceError(
      "Message must be a string",
      400,
    );
  }

  const messageText = content.trim();

  if (
    messageText.length === 0 ||
    messageText.length > MAX_MESSAGE_LENGTH
  ) {
    throw new ChatServiceError(
      "Message must contain between 1 and 5000 characters",
      400,
    );
  }

  const message = await ChatMessage.create({
    conversationId,
    senderId,
    message: messageText,
  });

  await Conversation.update(
    {
      lastMessageAt: message.createdAt,
    },
    {
      where: { id: conversationId },
    },
  );

  return ChatMessage.findByPk(message.id, {
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["id", "name", "role"],
      },
    ],
  });
};

export const markConversationMessagesRead = async (
  conversationId: string,
  readerId: string,
  role: "USER" | "ADMIN",
) => {
  await getConversationForUser(
    conversationId,
    readerId,
    role,
  );

  const where = {
    conversationId,
    readAt: null,
    senderId: {
      [Op.ne]: readerId,
    },
  };

  // Customers only mark admin messages as read.
  // Admins only mark customer messages as read.
  const senderFilter =
    role === "ADMIN"
      ? { role: "USER" as const }
      : { role: "ADMIN" as const };

  const senders = await User.findAll({
    where: senderFilter,
    attributes: ["id"],
  });

  const senderIds = senders.map((sender) => sender.id);

  if (senderIds.length === 0) {
    return 0;
  }

  const [updatedCount] = await ChatMessage.update(
  {
    readAt: new Date(),
  },
  {
    where: {
      conversationId,
      senderId: {
        [Op.ne]: readerId,
      },
      readAt: {
        [Op.is]: null,
      },
    },

    // Read-status updates do not modify message content.
    // Skip the message-or-attachment validator.
    validate: false,
  },
);

  return updatedCount;
};

export const getUnreadMessageCount = async (
  conversationId: string,
  readerId: string,
  role: "USER" | "ADMIN",
) => {
  await getConversationForUser(
    conversationId,
    readerId,
    role,
  );

  const senderRole =
    role === "ADMIN" ? "USER" : "ADMIN";

  return ChatMessage.count({
    where: {
      conversationId,
      readAt: null,
      senderId: {
        [Op.ne]: readerId,
      },
    },
    include: [
      {
        model: User,
        as: "sender",
        where: { role: senderRole },
        attributes: [],
        required: true,
      },
    ],
  });
};

export const getAdminTotalUnreadCount = async () => {
  return ChatMessage.count({
    where: {
      readAt: null,
    },
    include: [
      {
        model: User,
        as: "sender",
        where: {
          role: "USER",
        },
        attributes: [],
        required: true,
      },
    ],
  });
};
