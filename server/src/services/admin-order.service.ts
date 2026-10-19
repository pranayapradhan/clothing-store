import { Op, Transaction } from "sequelize";
import { sequelize } from "../config/database.js";
import { Inventory, Order, OrderItem } from "../models/index.js";
import type { OrderStatus } from "../models/Order.js";

interface AdminOrderListOptions {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}

interface UpdateAdminOrderStatusInput {
  status: OrderStatus;
  reason?: string;
}

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const getAdminOrders = async (options: AdminOrderListOptions) => {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 20));
  const offset = (page - 1) * limit;
  const search = options.search?.trim();

  const where = {
    ...(options.status ? { status: options.status } : {}),
    ...(search
      ? {
          [Op.or]: [
            { orderNumber: { [Op.iLike]: `%${search}%` } },
            { customerName: { [Op.iLike]: `%${search}%` } },
            { customerEmail: { [Op.iLike]: `%${search}%` } },
            { customerPhone: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {}),
  };

  const { rows, count } = await Order.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    orders: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getAdminOrderById = async (orderId: string) => {
  return Order.findByPk(orderId, {
    include: [
      {
        model: OrderItem,
        as: "items",
      },
    ],
  });
};

export const updateAdminOrderStatus = async (
  orderId: string,
  input: UpdateAdminOrderStatusInput,
) => {
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  });

  try {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (input.status === "DELIVERED") {
      const items = await OrderItem.findAll({
        where: { orderId: order.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      for (const item of items) {
        if (!item.variantId) {
          throw new Error(
            `Cannot fulfill order item ${item.id}: variant is missing`,
          );
        }

        const inventory = await Inventory.findOne({
          where: { variantId: item.variantId },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!inventory) {
          throw new Error(`Inventory not found for order item ${item.id}`);
        }

        if (inventory.reservedQuantity < item.quantity) {
          throw new Error(
            `Insufficient reserved inventory for SKU ${item.sku}`,
          );
        }

        if (inventory.quantity < item.quantity) {
          throw new Error(
            `Insufficient physical inventory for SKU ${item.sku}`,
          );
        }

        inventory.quantity -= item.quantity;
        inventory.reservedQuantity -= item.quantity;

        await inventory.save({ transaction });
      }
    }

    if (order.status === input.status) {
      throw new Error(`Order is already ${input.status}`);
    }

    const currentStatus = order.status as OrderStatus;
    const permittedStatuses = allowedTransitions[currentStatus];

    if (!permittedStatuses.includes(input.status)) {
      throw new Error(
        `Order cannot move from ${order.status} to ${input.status}`,
      );
    }

    if (input.status === "CANCELLED") {
      const items = await OrderItem.findAll({
        where: { orderId: order.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      for (const item of items) {
        if (!item.variantId) {
          continue;
        }

        const inventory = await Inventory.findOne({
          where: { variantId: item.variantId },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!inventory) {
          throw new Error(`Inventory not found for order item ${item.id}`);
        }

        if (inventory.reservedQuantity < item.quantity) {
          throw new Error(
            `Invalid reserved inventory for order item ${item.id}`,
          );
        }

        inventory.reservedQuantity -= item.quantity;

        await inventory.save({ transaction });
      }

      order.cancelledAt = new Date();
      order.cancelledBy = "ADMIN";
      order.cancellationReason = input.reason?.trim() || "Cancelled by admin";
    }

    order.status = input.status;

    await order.save({ transaction });

    await transaction.commit();

    return await getAdminOrderById(order.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};


export const confirmAdminOrderPayment = async (
  orderId: string,
) => {
  return sequelize.transaction(async (transaction) => {
    const order = await Order.findByPk(orderId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.paymentMethod !== "COD") {
      throw new Error("Only COD payments are supported");
    }

    if (order.status !== "DELIVERED") {
      throw new Error(
        "COD payment can only be confirmed for delivered orders",
      );
    }

    if (order.paymentStatus === "PAID") {
      throw new Error("Order payment is already confirmed");
    }

    order.paymentStatus = "PAID";

    await order.save({ transaction });

    return order;
  });
};
