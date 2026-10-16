import { body, param } from "express-validator";

export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Category slug is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Category slug must be between 2 and 120 characters")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("image")
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),

  body("parentId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Parent category ID must be a valid UUID"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("sortOrder must be a non-negative integer"),
];

export const updateCategoryValidator = [
  param("id")
    .isUUID()
    .withMessage("Category ID must be a valid UUID"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Category name must be between 2 and 100 characters"),

  body("slug")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Category slug must be between 2 and 120 characters")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("image")
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage("Image must be a valid URL"),

  body("parentId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Parent category ID must be a valid UUID"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("sortOrder must be a non-negative integer"),
];

export const categoryIdValidator = [
  param("id")
    .isUUID()
    .withMessage("Category ID must be a valid UUID"),
];