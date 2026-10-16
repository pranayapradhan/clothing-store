import { Router } from "express";

import {
  adjust,
  getByVariantId,
  getLowStock,
  initialize,
  release,
  reserve,
  set,
} from "../controllers/inventory.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
  adjustInventoryValidator,
  releaseInventoryValidator,
  reserveInventoryValidator,
  setInventoryValidator,
  variantInventoryIdValidator,
} from "../validators/inventory.validator.js";

const router = Router();

router.use(
  authenticate,
  authorize("ADMIN")
);

router.get(
  "/low-stock",
  getLowStock
);

router.get(
  "/:variantId",
  variantInventoryIdValidator,
  validate,
  getByVariantId
);

router.post(
  "/:variantId/initialize",
  variantInventoryIdValidator,
  validate,
  initialize
);

router.patch(
  "/:variantId",
  setInventoryValidator,
  validate,
  set
);

router.post(
  "/:variantId/adjust",
  adjustInventoryValidator,
  validate,
  adjust
);

router.post(
  "/:variantId/reserve",
  reserveInventoryValidator,
  validate,
  reserve
);

router.post(
  "/:variantId/release",
  releaseInventoryValidator,
  validate,
  release
);

export default router;