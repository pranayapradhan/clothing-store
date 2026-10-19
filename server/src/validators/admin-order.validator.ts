
import { body, param, query } from "express-validator";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const adminOrderIdValidator = [
  param("id")
    .isUUID()
    .withMessage("A valid order ID is required"),
];

export const adminOrderListValidator = [
  query("status")
    .optional()
    .isIn(ORDER_STATUSES)
    .withMessage("Invalid order status"),

  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search must not exceed 100 characters"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

export const updateAdminOrderStatusValidator = [
  ...adminOrderIdValidator,

  body("status")
    .isIn(ORDER_STATUSES)
    .withMessage("Invalid order status"),

  body("reason")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Reason must not exceed 255 characters"),
];
