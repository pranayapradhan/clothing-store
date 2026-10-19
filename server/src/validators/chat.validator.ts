
import { body, param, query } from "express-validator";

export const chatConversationIdValidator = [
  param("id")
    .isUUID()
    .withMessage("A valid conversation ID is required"),
];

export const chatPaginationValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

export const sendChatMessageValidator = [
  body("message")
    .isString()
    .withMessage("Message must be a string")
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage(
      "Message must contain between 1 and 5000 characters",
    ),
];
