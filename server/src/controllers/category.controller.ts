import type {
  Request,
  Response,
  RequestHandler,
} from "express";

import {
  createCategory,
  activateCategory,
  deactivateCategory,
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
} from "../services/category.service.js";
import { getStringParam } from "../helper/helper.js";

interface CategoryIdParams {
  id: string;
}

interface CategorySlugParams {
  slug: string;
}


export const create = async (
  req: Request,
  res: Response
) => {
  try {
    const category = await createCategory(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create category";

    res.status(400).json({
      success: false,
      message,
    });
  }
};

export const getAll = async (
  _req: Request,
  res: Response
) => {
  try {
    const categories = await getCategories();

    res.status(200).json({
      success: true,
      data: {
        categories,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const getById: RequestHandler = async (req, res) => {
  try {
    const category = await getCategoryById(
      getStringParam(req.params.id)
    );

    res.status(200).json({
      success: true,
      data: {
        category,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch category";

    const status =
      message === "Category not found" ? 404 : 400;

    res.status(status).json({
      success: false,
      message,
    });
  }
};

export const getBySlug: RequestHandler = async (req, res) => {
  try {
    const category = await getCategoryBySlug(
      getStringParam(req.params.slug)
    );

    res.status(200).json({
      success: true,
      data: {
        category,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch category";

    const status =
      message === "Category not found" ? 404 : 400;

    res.status(status).json({
      success: false,
      message,
    });
  }
};

export const update: RequestHandler = async (req, res) => {
  try {
    const category = await updateCategory(
      getStringParam(req.params.id),
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: {
        category,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update category";

    const status =
      message === "Category not found" ? 404 : 400;

    res.status(status).json({
      success: false,
      message,
    });
  }
};

export const deactivate: RequestHandler = async (
  req,res
) => {
  try {
    const categoryId = getStringParam(
      req.params.id
    );

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const category =
      await deactivateCategory(categoryId);

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to deactivate category";

    const status =
      message === "Category not found"
        ? 404
        : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

export const activate: RequestHandler = async (
  req,res
) => {
  try {
    const categoryId = getStringParam(
      req.params.id
    );

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const category =
      await activateCategory(categoryId);

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to activate category";

    const status =
      message === "Category not found"
        ? 404
        : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};