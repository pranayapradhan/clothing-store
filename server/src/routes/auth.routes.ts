import { Router } from "express";

import {
  getCurrentUser,
  login,
  logout,
  register,
  refresh,
} from "../controllers/auth.controller.js";

import {
  loginValidator,
  registerValidator,
} from "../validators/auth.validator.js";

import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
const router = Router();

router.post(
  "/register",
  registerValidator,
  validate,
  register
);

router.post(
  "/login",
  loginValidator,
  validate,
  login
);

router.post(
  "/logout",
  logout
);

router.get(
  "/me",
  authenticate,
  getCurrentUser
);

router.post(
  "/refresh",
  refresh
);

export default router;