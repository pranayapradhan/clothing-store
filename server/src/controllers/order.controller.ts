import { Request, Response } from "express";
import {
  createCodOrder,
  getUserOrders,
  getUserOrderById,
  cancelUserOrder,
} from "../services/order.service.js";
import { CheckoutRequest, CancelOrderRequest } from "../types/order.types.js";

export const createOrder = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const checkoutData = req.body as CheckoutRequest;

    const order = await createCodOrder(req.user.id, checkoutData);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create order";

    return res.status(400).json({
      success: false,
      message,
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const orders = await getUserOrders(req.user.id);

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    const order = await getUserOrderById(req.user.id, Array.isArray(id) ? id[0] : id);

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
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
try {
if (!req.user) {
return res.status(401).json({
success: false,
message: "Authentication required",
});
}

const { id } = req.params;
const orderId = Array.isArray(id) ? id[0] : id;

const { reason } = req.body as CancelOrderRequest;

const order = await cancelUserOrder(
  req.user.id,
  orderId,
  reason,
);

return res.status(200).json({
  success: true,
  message: "Order cancelled successfully",
  data: order,
});

} catch (error) {
const message =
error instanceof Error ? error.message : "Failed to cancel order";

if (message === "Order not found") {
  return res.status(404).json({
    success: false,
    message,
  });
}

if (message.startsWith("Order cannot be cancelled")) {
  return res.status(400).json({
    success: false,
    message,
  });
}

return res.status(400).json({
  success: false,
  message,
});

}
};

// "id": "8c2da7a8-f140-455a-8606-d1b9a118a54d",
//             "userId": "c8aa3f26-1950-4eba-9271-9993748d5335",
//             "orderNumber": "CLO-20260904-7CEDEB09",
//             "status": "CONFIRMED",