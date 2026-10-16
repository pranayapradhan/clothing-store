
import type { RequestHandler } from "express";

import {
  addToWishlist,
  clearWishlist,
  getWishlist,
  isProductInWishlist,
  removeFromWishlist,
} from "../services/wishlist.service.js";

export const getMyWishlist: RequestHandler =
  async (req, res) => {
    try {
      const userId = req.user!.id;

      const wishlist =
        await getWishlist(userId);

      res.status(200).json({
        success: true,
        data: wishlist,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch wishlist",
      });
    }
  };

export const addItem: RequestHandler =
  async (req, res) => {
    try {
      const userId = req.user!.id;

      const { productId } = req.body;

      const wishlist =
        await addToWishlist(
          userId,
          productId
        );

      res.status(201).json({
        success: true,
        message:
          "Product added to wishlist",
        data: wishlist,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to add product to wishlist",
      });
    }
  };

export const removeItem: RequestHandler =
  async (req, res) => {
    try {
      const userId = req.user!.id;

      const productId =
        typeof req.params.productId ===
        "string"
          ? req.params.productId
          : undefined;

      if (!productId) {
        res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
        return;
      }

      const wishlist =
        await removeFromWishlist(
          userId,
          productId
        );

      res.status(200).json({
        success: true,
        message:
          "Product removed from wishlist",
        data: wishlist,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to remove product from wishlist",
      });
    }
  };

export const clearMyWishlist: RequestHandler =
  async (req, res) => {
    try {
      const userId = req.user!.id;

      const wishlist =
        await clearWishlist(userId);

      res.status(200).json({
        success: true,
        message: "Wishlist cleared",
        data: wishlist,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to clear wishlist",
      });
    }
  };

export const checkProduct: RequestHandler =
  async (req, res) => {
    try {
      const userId = req.user!.id;

      const productId =
        typeof req.params.productId ===
        "string"
          ? req.params.productId
          : undefined;

      if (!productId) {
        res.status(400).json({
          success: false,
          message:
            "Product ID is required",
        });
        return;
      }

      const isInWishlist =
        await isProductInWishlist(
          userId,
          productId
        );

      res.status(200).json({
        success: true,
        data: {
          isInWishlist,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to check wishlist",
      });
    }
  };
