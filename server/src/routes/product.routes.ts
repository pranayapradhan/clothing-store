import { Router } from "express";

import {
  getAll,
  getById,
  getBySlug,
  getVariantById,
} from "../controllers/product.controller.js";

import {
  getProductsValidator,
  productIdValidator,
  productSlugValidator,
  productVariantIdValidator,
} from "../validators/product.validator.js";

import { validate } from "../middleware/validate.js";

const router = Router();

// Public product routes
router.get("/", getProductsValidator, validate, getAll);

router.get(
  "/slug/:slug",
  productSlugValidator,
  validate,
  getBySlug
);

router.get(
  "/variant/:id",
  productVariantIdValidator,
  validate,
  getVariantById
);

router.get(
  "/:id",
  productIdValidator,
  validate,
  getById
);

export default router;