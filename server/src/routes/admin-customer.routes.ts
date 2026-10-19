
import { Router } from "express";

import {
  getAdminCustomersController,
  getAdminCustomerByIdController,
} from "../controllers/admin-customer.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
  adminCustomerListValidator,
  adminCustomerIdValidator,
} from "../validators/admin-customer.validator.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get(
  "/",
  adminCustomerListValidator,
  validate,
  getAdminCustomersController,
);

router.get(
  "/:id",
  adminCustomerIdValidator,
  validate,
  getAdminCustomerByIdController,
);

export default router;
