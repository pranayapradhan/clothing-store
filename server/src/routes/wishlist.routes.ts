import { Router } from "express";

import {
  addItem,
  checkProduct,
  clearMyWishlist,
  getMyWishlist,
  removeItem,
} from "../controllers/wishlist.controller.js";

import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";

import {
  addToWishlistValidator,
  wishlistProductIdValidator,
} from "../validators/wishlist.validator.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  getMyWishlist
);

router.post(
  "/items",
  addToWishlistValidator,
  validate,
  addItem
);

router.delete(
  "/items/:productId",
  wishlistProductIdValidator,
  validate,
  removeItem
);

router.delete(
  "/",
  clearMyWishlist
);

router.get(
  "/check/:productId",
  wishlistProductIdValidator,
  validate,
  checkProduct
);

export default router;
