import type { RequestHandler } from "express";

import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../services/cart.service.js";

export const getMyCart: RequestHandler = async (
  req,
  res
) => {
  try {
    const userId = req.user!.id;

    const cart = await getCart(userId);

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch cart",
    });
  }
};

export const addItem: RequestHandler = async (
  req,
  res
) => {
  try {
    const userId = req.user!.id;

    const {
      variantId,
      quantity,
    } = req.body;

    const cart = await addToCart(
      userId,
      variantId,
      quantity
    );

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to add item to cart",
    });
  }
};

export const updateItem: RequestHandler =
  async (req, res) => {
    try {
      const userId = req.user!.id;

      const itemId =
        typeof req.params.itemId === "string"
          ? req.params.itemId
          : undefined;

      const { quantity } = req.body;

      if (!itemId) {
        res.status(400).json({
          success: false,
          message: "Cart item ID is required",
        });
        return;
      }

      const cart = await updateCartItem(
        userId,
        itemId,
        quantity
      );

      res.status(200).json({
        success: true,
        message: "Cart item updated",
        data: cart,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update cart item",
      });
    }
  };

export const removeItem: RequestHandler =
  async (req, res) => {
    try {
      const userId = req.user!.id;

      const itemId =
        typeof req.params.itemId === "string"
          ? req.params.itemId
          : undefined;

      if (!itemId) {
        res.status(400).json({
          success: false,
          message: "Cart item ID is required",
        });
        return;
      }

      const cart = await removeCartItem(
        userId,
        itemId
      );

      res.status(200).json({
        success: true,
        message: "Item removed from cart",
        data: cart,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to remove cart item",
      });
    }
  };

export const clearMyCart: RequestHandler =
  async (req, res) => {
    try {
      const userId = req.user!.id;

      const cart = await clearCart(userId);

      res.status(200).json({
        success: true,
        message: "Cart cleared",
        data: cart,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to clear cart",
      });
    }
  };
