
import { param, query } from "express-validator";

export const adminCustomerListValidator = [
  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string")
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

export const adminCustomerIdValidator = [
  param("id")
    .isUUID()
    .withMessage("A valid customer ID is required"),
];
