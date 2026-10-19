
import { Router } from "express";
import {
  getAdminOrderByIdController,
  getAdminOrdersController,
  updateAdminOrderStatusController,
  confirmAdminOrderPaymentController,
} from "../controllers/admin-order.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  adminOrderIdValidator,
  adminOrderListValidator,
  updateAdminOrderStatusValidator,
} from "../validators/admin-order.validator.js";

const router = Router();

// All routes require an authenticated administrator.
router.use(authenticate, authorize("ADMIN"));

// GET /api/v1/admin/orders
router.get(
  "/",
  adminOrderListValidator,
  validate,
  getAdminOrdersController,
);

// GET /api/v1/admin/orders/:id
router.get(
  "/:id",
  adminOrderIdValidator,
  validate,
  getAdminOrderByIdController,
);

// PATCH /api/v1/admin/orders/:id/status
router.patch(
  "/:id/status",
  updateAdminOrderStatusValidator,
  validate,
  updateAdminOrderStatusController,
);

// PATCH /api/v1/admin/orders/:id/confirm-payment
router.patch(
  "/:id/confirm-payment",
  adminOrderIdValidator,
  validate,
  confirmAdminOrderPaymentController,
);


export default router;
