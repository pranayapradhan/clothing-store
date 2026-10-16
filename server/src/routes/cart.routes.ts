import { Router } from "express";

import {
  addItem,
  clearMyCart,
  getMyCart,
  removeItem,
  updateItem,
} from "../controllers/cart.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import {
  addToCartValidator,
  cartItemIdValidator,
  updateCartItemValidator,
} from "../validators/cart.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", getMyCart);

router.post(
  "/items",
  addToCartValidator,
  validate,
  addItem
);

router.patch(
  "/items/:itemId",
  updateCartItemValidator,
  validate,
  updateItem
);

router.delete(
  "/items/:itemId",
  cartItemIdValidator,
  validate,
  removeItem
);

router.delete(
  "/",
  clearMyCart
);

export default router;
