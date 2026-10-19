
import type { Request, Response } from "express";

import {
  ChatServiceError,
  getOrCreateCustomerConversation,
  getCustomerConversations,
  getConversationMessages,
  sendChatMessage,
  markConversationMessagesRead,
  getUnreadMessageCount,
  getAdminTotalUnreadCount,
} from "../services/chat.service.js";



const getAuthenticatedUser = (req: Request) => {
  if (!req.user) {
    throw new ChatServiceError(
      "Authentication required",
      401,
    );
  }

  return req.user;
};


const getParamId = (req: Request): string => {
  const id = req.params.id;

  return Array.isArray(id) ? id[0] : id;
};

const handleChatError = (
  error: unknown,
  res: Response,
) => {
  if (error instanceof ChatServiceError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Chat API error:", error);

  return res.status(500).json({
    success: false,
    message: "An unexpected chat error occurred",
  });
};

export const getMyConversationController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = getAuthenticatedUser(req);

    if (user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Customer access required",
      });
    }

    const conversation =
      await getOrCreateCustomerConversation(user.id);

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    return handleChatError(error, res);
  }
};

export const getAdminConversationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = getAuthenticatedUser(req);

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const result = await getCustomerConversations(
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      data: result.conversations,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleChatError(error, res);
  }
};

export const getConversationMessagesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = getAuthenticatedUser(req);
    const conversationId = getParamId(req);

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 30);

    const result = await getConversationMessages(
      conversationId,
      user.id,
      user.role,
      page,
      limit,
    );

    return res.status(200).json({
      success: true,
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleChatError(error, res);
  }
};

export const sendChatMessageController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = getAuthenticatedUser(req);
    const conversationId = getParamId(req);

    const message = await sendChatMessage(
      conversationId,
      user.id,
      user.role,
      req.body.message,
    );

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    return handleChatError(error, res);
  }
};

export const markChatMessagesReadController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = getAuthenticatedUser(req);
    const conversationId = getParamId(req);

    const updatedCount =
      await markConversationMessagesRead(
        conversationId,
        user.id,
        user.role,
      );

    return res.status(200).json({
      success: true,
      data: {
        updatedCount,
      },
    });
  } catch (error) {
    return handleChatError(error, res);
  }
};

export const getUnreadMessagesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = getAuthenticatedUser(req);
    const conversationId = getParamId(req);

    const unreadCount = await getUnreadMessageCount(
      conversationId,
      user.id,
      user.role,
    );

    return res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    return handleChatError(error, res);
  }
};

export const getAdminTotalUnreadCountController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = getAuthenticatedUser(req);

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const unreadCount = await getAdminTotalUnreadCount();

    return res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    return handleChatError(error, res);
  }
};
