import { body, param, query } from "express-validator";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createProductValidator = [
  body("categoryId").isUUID().withMessage("Valid category ID is required"),

  body("name")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Product name must be between 2 and 200 characters"),

  body("slug")
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description cannot exceed 5000 characters"),

  body("brand")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Brand cannot exceed 100 characters"),

  body("basePrice")
    .isFloat({ min: 0 })
    .withMessage("Base price must be a valid positive number"),

  body("discountPrice")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Discount price must be a valid positive number"),

  body("isActive")
    .optional()
    .toBoolean()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export const updateProductValidator = [
  param("id").isUUID().withMessage("Valid product ID is required"),

  body("categoryId")
    .optional()
    .isUUID()
    .withMessage("Valid category ID is required"),

  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Product name must be between 2 and 200 characters"),

  body("slug")
    .optional()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description cannot exceed 5000 characters"),

  body("brand")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Brand cannot exceed 100 characters"),

  body("basePrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Base price must be a valid positive number"),

  body("discountPrice")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Discount price must be a valid positive number"),

  body("isActive")
    .optional()
    .toBoolean()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("removeMainImage")
    .optional()
    .toBoolean()
    .isBoolean()
    .withMessage("removeMainImage must be a boolean"),

  body("removeImagePublicIds")
    .optional()
    .isJSON()
    .withMessage("removeImagePublicIds must be a valid JSON array"),

  body("imagePublicIds")
    .optional()
    .isJSON()
    .withMessage("imagePublicIds must be a valid JSON array"),
];

export const productIdValidator = [
  param("id").isUUID().withMessage("Valid product ID is required"),
];

export const productSlugValidator = [
  param("slug").trim().matches(slugRegex).withMessage("Invalid product slug"),
];

export const createProductVariantValidator = [
  body("productId").isUUID().withMessage("Valid product ID is required"),

  body("color")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Color must be between 2 and 50 characters"),

  body("colorCode")
    .optional({ nullable: true })
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage("Color code must be a valid hexadecimal color"),

  body("size")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Size must be between 1 and 20 characters"),

  body("sku")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("SKU must be between 2 and 100 characters"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a valid non-negative number"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export const updateProductVariantValidator = [
  param("id").isUUID().withMessage("Valid variant ID is required"),

  body("color")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Color must be between 2 and 50 characters"),

  body("colorCode")
    .optional({ nullable: true })
    .trim()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage("Color code must be a valid hexadecimal color"),

  body("size")
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Size must be between 1 and 20 characters"),

  body("sku")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("SKU must be between 2 and 100 characters"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a valid non-negative number"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

export const productVariantIdValidator = [
  param("id").isUUID().withMessage("Valid variant ID is required"),
];

export const getProductsValidator = [
  query("category")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Category must be between 1 and 120 characters"),

  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search must be between 1 and 100 characters"),

  query("brand")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Brand must be between 1 and 100 characters"),

  query("size")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Size must be between 1 and 20 characters"),

  query("color")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Color must be between 1 and 50 characters"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a non-negative number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a non-negative number"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
];
