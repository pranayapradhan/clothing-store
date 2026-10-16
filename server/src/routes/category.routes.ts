import { Router } from "express";

import {
  getAll,
  getById,
  getBySlug,
} from "../controllers/category.controller.js";

import { categoryIdValidator } from "../validators/category.validator.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", getAll);

router.get(
  "/slug/:slug",
  getBySlug
);

router.get(
  "/:id",
  categoryIdValidator,
  validate,
  getById
);

export default router;