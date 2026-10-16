import { body, param } from "express-validator";

export const addToCartValidator = [
  body("variantId")
    .isUUID()
    .withMessage("Valid variant ID is required"),

  body("quantity")
    .isInt({ min: 1 })
    .withMessage(
      "Quantity must be a positive integer"
    ),
];

export const updateCartItemValidator = [
  param("itemId")
    .isUUID()
    .withMessage("Valid cart item ID is required"),

  body("quantity")
    .isInt({ min: 1 })
    .withMessage(
      "Quantity must be a positive integer"
    ),
];

export const cartItemIdValidator = [
  param("itemId")
    .isUUID()
    .withMessage("Valid cart item ID is required"),
];