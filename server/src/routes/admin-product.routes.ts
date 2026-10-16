import { Router } from "express";

import {
  create,
  createVariant,
  remove,
  removeVariant,
  update,
  updateVariant,
  activate,
  getAdminProducts,
  getAdminProduct,
} from "../controllers/product.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
  createProductValidator,
  createProductVariantValidator,
  productIdValidator,
  productVariantIdValidator,
  updateProductValidator,
  updateProductVariantValidator,
} from "../validators/product.validator.js";
import {
  uploadProductFiles,
  requireMainProductImage,
} from "../middleware/uploader.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

// Products
router.post(
  "/",
  uploadProductFiles,
  createProductValidator,
  validate,
  requireMainProductImage,
  create,
);

router.patch(
  "/:id",
  uploadProductFiles,
  updateProductValidator,
  validate,
  update,
);

router.delete("/:id", productIdValidator, validate, remove);

router.patch("/:id/activate", productIdValidator, validate, activate);

// Variants
router.post(
  "/variants",
  createProductVariantValidator,
  validate,
  createVariant,
);

router.patch(
  "/variants/:id",
  updateProductVariantValidator,
  validate,
  updateVariant,
);

router.delete(
  "/variants/:id",
  productVariantIdValidator,
  validate,
  removeVariant,
);

router.get("/", getAdminProducts);
router.get("/:id", productIdValidator, validate, getAdminProduct);

export default router;
