import { Router } from "express";
import { createOrder, getOrderById, getOrders, cancelOrder } from "../controllers/order.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { checkoutValidator, cancelOrderValidator } from "../validators/order.validator.js";

const router = Router();

router.get("/", authenticate, getOrders);

router.get("/:id", authenticate, getOrderById);
router.post(
  "/",
  authenticate,
  checkoutValidator,
  validate,
  createOrder
);
router.patch(
"/:id/cancel",
authenticate,
cancelOrderValidator,
validate,
cancelOrder,
);
export default router;