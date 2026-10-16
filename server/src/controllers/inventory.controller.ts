import type {  RequestHandler } from "express";
import type { NextFunction, Request, Response } from "express";
import * as inventoryService from "../services/inventory.service.js";
import {
  adjustInventory,
  getInventoryByVariantId,
  getLowStockInventory,
  initializeInventory,
  releaseInventory,
  reserveInventory,
  setInventory,
} from "../services/inventory.service.js";

const getStringParam = (
  value: string | string[] | undefined
): string => {
  if (typeof value !== "string") {
    throw new Error("Invalid route parameter");
  }

  return value;
};

// Get inventory for a variant
export const getByVariantId: RequestHandler = async (
  req,
  res
) => {
  try {
    const variantId = getStringParam(
      req.params.variantId
    );

    const inventory =
      await getInventoryByVariantId(variantId);

    if (!inventory) {
      res.status(404).json({
        success: false,
        message: "Inventory not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch inventory",
    });
  }
};

// Initialize inventory
export const initialize: RequestHandler = async (
  req,
  res
) => {
  try {
    const variantId = getStringParam(
      req.params.variantId
    );

    const inventory =
      await initializeInventory(
        variantId,
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Inventory initialized successfully",
      data: inventory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to initialize inventory",
    });
  }
};

// Set exact stock quantity
export const set: RequestHandler = async (req, res) => {
  try {
    const variantId = getStringParam(
      req.params.variantId
    );

    const inventory = await setInventory(
      variantId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      data: inventory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update inventory",
    });
  }
};

// Adjust stock
export const adjust: RequestHandler = async (
  req,
  res
) => {
  try {
    const variantId = getStringParam(
      req.params.variantId
    );

    const inventory = await adjustInventory(
      variantId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Inventory adjusted successfully",
      data: inventory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to adjust inventory",
    });
  }
};

// Reserve stock
export const reserve: RequestHandler = async (
  req,
  res
) => {
  try {
    const variantId = getStringParam(
      req.params.variantId
    );

    const inventory = await reserveInventory(
      variantId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Inventory reserved successfully",
      data: inventory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to reserve inventory",
    });
  }
};

// Release reserved stock
export const release: RequestHandler = async (
  req,
  res
) => {
  try {
    const variantId = getStringParam(
      req.params.variantId
    );

    const inventory = await releaseInventory(
      variantId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Inventory released successfully",
      data: inventory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to release inventory",
    });
  }
};

// Low-stock inventory
export const getLowStock: RequestHandler = async (
  _req,
  res
) => {
  try {
    const inventory = await getLowStockInventory();

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch low-stock inventory",
    });
  }
};

export const getVariantAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const variantId = getStringParam(req.params.variantId);

    const availability =
      await inventoryService.getVariantAvailability(variantId);

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};