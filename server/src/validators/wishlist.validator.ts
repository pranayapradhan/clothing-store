import { body, param } from "express-validator";

export const addToWishlistValidator = [
  body("productId")
    .isUUID()
    .withMessage("Valid product ID is required"),
];

export const wishlistProductIdValidator = [
  param("productId")
    .isUUID()
    .withMessage("Valid product ID is required"),
];
