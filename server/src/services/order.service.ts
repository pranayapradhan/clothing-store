import crypto from "node:crypto";
import { Transaction } from "sequelize";
import { sequelize } from "../config/database.js";
import {
  Cart,
  CartItem,
  Inventory,
  Order,
  OrderItem,
  Product,
  ProductVariant,
  User,
} from "../models/index.js";
import { CheckoutRequest } from "../types/order.types.js";
import { Op } from "sequelize";

const COD_DELIVERY_CHARGE = 150;

const generateOrderNumber = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `CLO-${date}-${randomPart}`;
};

export const createCodOrder = async (
  userId: string,
  checkoutData: CheckoutRequest,
) => {
  const transaction = await sequelize.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  });

  try {
    const cart = await Cart.findOne({
      where: {
        userId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!cart) {
      throw new Error("Cart not found");
    }

    const cartItems = await CartItem.findAll({
      where: {
        cartId: cart.id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (cartItems.length === 0) {
      throw new Error("Your cart is empty");
    }

    const orderItemsData: Array<{
      variantId: string;
      productName: string;
      productSlug: string;
      productImage: string | null;
      color: string;
      size: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }> = [];

    let subtotal = 0;

    for (const cartItem of cartItems) {
      const variant = await ProductVariant.findOne({
        where: {
          id: cartItem.variantId,
          isActive: true,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!variant) {
        throw new Error(`A product in your cart is no longer available`);
      }

      const product = await Product.findOne({
        where: {
          id: variant.productId,
          isActive: true,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        throw new Error(`${variant.sku} is no longer available`);
      }

      const inventory = await Inventory.findOne({
        where: {
          variantId: variant.id,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!inventory) {
        throw new Error(`Inventory is not configured for ${product.name}`);
      }

      const availableQuantity = inventory.quantity - inventory.reservedQuantity;

      if (availableQuantity < cartItem.quantity) {
        throw new Error(
          `${product.name} (${variant.color}, ${variant.size}) has only ${availableQuantity} item(s) available`,
        );
      }

      const unitPrice = Number(variant.price);
      const quantity = cartItem.quantity;
      const lineTotal = unitPrice * quantity;

      subtotal += lineTotal;

      orderItemsData.push({
        variantId: variant.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.mainImage,
        color: variant.color,
        size: variant.size,
        sku: variant.sku,
        unitPrice,
        quantity,
        lineTotal,
      });
    }

    const deliveryCharge = orderItemsData.length > 0 ? COD_DELIVERY_CHARGE : 0;

    const discount = 0;

    const total = subtotal + deliveryCharge - discount;

    const order = await Order.create(
      {
        userId,
        orderNumber: generateOrderNumber(),
        status: "CONFIRMED",
        paymentMethod: "COD",
        paymentStatus: "PENDING",

        customerName: checkoutData.customerName,
        customerEmail: await getUserEmail(userId, transaction),
        customerPhone: checkoutData.customerPhone,

        shippingAddressLine1: checkoutData.shippingAddressLine1,

        shippingAddressLine2: checkoutData.shippingAddressLine2 || null,

        shippingCity: checkoutData.shippingCity,

        shippingState: checkoutData.shippingState || null,

        shippingPostalCode: checkoutData.shippingPostalCode || null,

        shippingCountry: "Nepal",

        notes: checkoutData.notes || null,

        subtotal: subtotal.toFixed(2),
        deliveryCharge: deliveryCharge.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2),
      },
      {
        transaction,
      },
    );

    for (const item of orderItemsData) {
      await OrderItem.create(
        {
          orderId: order.id,
          variantId: item.variantId,

          productName: item.productName,
          productSlug: item.productSlug,
          productImage: item.productImage,

          color: item.color,
          size: item.size,
          sku: item.sku,

          unitPrice: item.unitPrice.toFixed(2),
          quantity: item.quantity,
          lineTotal: item.lineTotal.toFixed(2),
        },
        {
          transaction,
        },
      );

      const inventory = await Inventory.findOne({
        where: {
          variantId: item.variantId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!inventory) {
        throw new Error(`Inventory not found for SKU ${item.sku}`);
      }

      inventory.reservedQuantity += item.quantity;

      await inventory.save({
        transaction,
      });
    }

    await CartItem.destroy({
      where: {
        cartId: cart.id,
      },
      transaction,
    });

    await transaction.commit();

    return await Order.findOne({
      where: {
        id: order.id,
      },
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getUserOrders = async (userId: string) => {
  return Order.findAll({
    where: {
      userId,
    },
    include: [
      {
        model: OrderItem,
        as: "items",
        attributes: [
          "id",
          "productName",
          "productSlug",
          "productImage",
          "color",
          "size",
          "sku",
          "unitPrice",
          "quantity",
          "lineTotal",
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const getUserOrderById = async (userId: string, orderId: string) => {
  return Order.findOne({
    where: {
      id: orderId,
      userId,
    },
    include: [
      {
        model: OrderItem,
        as: "items",
        attributes: [
          "id",
          "variantId",
          "productName",
          "productSlug",
          "productImage",
          "color",
          "size",
          "sku",
          "unitPrice",
          "quantity",
          "lineTotal",
        ],
      },
    ],
  });
};

export const cancelUserOrder = async (
  userId: string,
  orderId: string,
  reason: string,
) => {
  const transaction = await Order.sequelize!.transaction({
    isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
  });

  try {
    const order = await Order.findOne({
      where: { id: orderId, userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const orderItems = await OrderItem.findAll({
      where: { orderId: order.id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (
      order.status !== "PENDING" &&
      order.status !== "CONFIRMED" &&
      order.status !== "PROCESSING"
    ) {
      throw new Error(
        `Order cannot be cancelled when its status is ${order.status}`,
      );
    }

    for (const item of orderItems) {
      if (!item.variantId) {
        continue;
      }

      const inventory = await Inventory.findOne({
        where: {
          variantId: item.variantId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!inventory) {
        throw new Error(`Inventory not found for order item ${item.id}`);
      }

      if (inventory.reservedQuantity < item.quantity) {
        throw new Error(`Invalid reserved inventory for order item ${item.id}`);
      }

      inventory.reservedQuantity -= item.quantity;

      await inventory.save({
        transaction,
      });
    }

    order.status = "CANCELLED";
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.cancelledBy = "USER";

    await order.save({
      transaction,
    });

    await transaction.commit();

    return order;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getUserEmail = async (
  userId: string,
  transaction: Transaction,
): Promise<string> => {
  const user = await User.findOne({
    where: {
      id: userId,
    },
    attributes: ["email"],
    transaction,
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user.email;
};
