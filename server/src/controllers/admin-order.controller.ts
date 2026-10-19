
import { Request, Response } from "express";

import {
  getAdminOrderById,
  getAdminOrders,
  updateAdminOrderStatus,
  confirmAdminOrderPayment,
} from "../services/admin-order.service.js";

import type { OrderStatus } from "../models/Order.js";

export const getAdminOrdersController = async (
  req: Request,
  res: Response,
) => {
  try {
    const status = req.query.status as OrderStatus | undefined;
    const search = req.query.search as string | undefined;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const result = await getAdminOrders({
      status,
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get admin orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getAdminOrderByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const order = await getAdminOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get admin order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

export const updateAdminOrderStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const { status, reason } = req.body as {
      status: OrderStatus;
      reason?: string;
    };

    const order = await updateAdminOrderStatus(id, {
      status,
      reason,
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update order status";

    if (message === "Order not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (
      message.startsWith("Order cannot move") ||
      message.startsWith("Order is already")
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    console.error("Update admin order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};



export const confirmAdminOrderPaymentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const order = await confirmAdminOrderPayment(id);

    return res.status(200).json({
      success: true,
      message: "COD payment confirmed successfully",
      data: order,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to confirm COD payment";

    if (message === "Order not found") {
      return res.status(404).json({
        success: false,
        message,
      });
    }

    if (
      message === "Only COD payments are supported" ||
      message === "COD payment can only be confirmed for delivered orders" ||
      message === "Order payment is already confirmed"
    ) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    console.error("Confirm COD payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to confirm COD payment",
    });
  }
};
