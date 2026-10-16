import { Router } from "express";

import {
  activate,
  create,
  deactivate,
  update,
} from "../controllers/category.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
  categoryIdValidator,
  createCategoryValidator,
  updateCategoryValidator,
} from "../validators/category.validator.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.post(
  "/",
  createCategoryValidator,
  validate,
  create
);

router.patch(
  "/:id",
  updateCategoryValidator,
  validate,
  update
);

router.patch(
  "/:id/deactivate",
  categoryIdValidator,
  validate,
  deactivate
);

router.patch(
  "/:id/activate",
  categoryIdValidator,
  validate,
  activate
);

export default router;