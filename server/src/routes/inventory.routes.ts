import { Router } from "express";

import { getVariantAvailability } from "../controllers/inventory.controller.js";
import { validate } from "../middleware/validate.js";
import { publicVariantAvailabilityValidator } from "../validators/inventory.validator.js";

const router = Router();

router.get(
  "/variants/:variantId/availability",
  publicVariantAvailabilityValidator,
  validate,
  getVariantAvailability
);

export default router;