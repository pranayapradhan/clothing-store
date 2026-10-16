import { body, param } from "express-validator";

export const variantInventoryIdValidator = [
  param("variantId")
    .isUUID()
    .withMessage("Valid variant ID is required"),
];

export const publicVariantAvailabilityValidator = [
  param("variantId")
    .isUUID()
    .withMessage("Valid variant ID is required"),
];

export const setInventoryValidator = [
  param("variantId")
    .isUUID()
    .withMessage("Valid variant ID is required"),

  body("quantity")
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),

  body("lowStockThreshold")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Low stock threshold must be a non-negative integer"
    ),
];

export const adjustInventoryValidator = [
  param("variantId")
    .isUUID()
    .withMessage("Valid variant ID is required"),

  body("quantity")
    .isInt()
    .withMessage("Quantity adjustment must be an integer"),
];

export const reserveInventoryValidator = [
  param("variantId")
    .isUUID()
    .withMessage("Valid variant ID is required"),

  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Reservation quantity must be at least 1"),
];

export const releaseInventoryValidator = [
  param("variantId")
    .isUUID()
    .withMessage("Valid variant ID is required"),

  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Release quantity must be at least 1"),
];