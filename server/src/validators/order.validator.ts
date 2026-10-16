import { body } from "express-validator";

export const checkoutValidator = [
  body("customerName")
    .trim()
    .notEmpty()
    .withMessage("Customer name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Customer name must be between 2 and 100 characters"),

  body("customerPhone")
    .trim()
    .notEmpty()
    .withMessage("Customer phone is required")
    .isLength({ min: 7, max: 30 })
    .withMessage("Customer phone must be between 7 and 30 characters")
    .matches(/^[0-9+() -]+$/)
    .withMessage("Invalid phone number format"),

  body("shippingAddressLine1")
    .trim()
    .notEmpty()
    .withMessage("Shipping address is required")
    .isLength({ min: 5, max: 255 })
    .withMessage("Shipping address must be between 5 and 255 characters"),

  body("shippingAddressLine2")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Address line 2 cannot exceed 255 characters"),

  body("shippingCity")
    .trim()
    .notEmpty()
    .withMessage("Shipping city is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Shipping city must be between 2 and 100 characters"),

  body("shippingState")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Shipping state cannot exceed 100 characters"),

  body("shippingPostalCode")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 20 })
    .withMessage("Postal code cannot exceed 20 characters"),

  body("notes")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes cannot exceed 1000 characters"),
];

export const cancelOrderValidator = [
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Cancellation reason is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Cancellation reason must be between 3 and 255 characters"),
];
