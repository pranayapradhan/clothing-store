import { Op } from "sequelize";

import {
Order,
Product,
Inventory,
ProductVariant,
User,
} from "../models/index.js";

const SALES_STATUSES = [
"CONFIRMED",
"PROCESSING",
"SHIPPED",
"DELIVERED",
] as const;

interface RecentOrder {
id: string;
orderNumber: string;
customerName: string;
total: number;
status: string;
createdAt: Date;
}

interface LowStockItem {
variantId: string;
productName: string;
sku: string;
color: string | null;
size: string | null;
quantity: number;
reservedQuantity: number;
availableQuantity: number;
lowStockThreshold: number;
}

export interface DashboardStats {
overview: {
totalSales: number;
totalOrders: number;
totalCustomers: number;
totalProducts: number;
pendingOrders: number;
processingOrders: number;
};
recentOrders: RecentOrder[];
lowStock: LowStockItem[];
}

interface InventoryWithRelations extends Inventory {
variant?: ProductVariant & {
product?: Product;
};
}

export const getDashboardStats =
async (): Promise<DashboardStats> => {
const [
totalOrders,
totalCustomers,
totalProducts,
pendingOrders,
processingOrders,
recentOrderRows,
] = await Promise.all([
Order.count(),

  User.count({
    where: {
      role: "USER",
    },
  }),

  Product.count(),

  Order.count({
    where: {
      status: "PENDING",
    },
  }),

  Order.count({
    where: {
      status: "PROCESSING",
    },
  }),

  Order.findAll({
    limit: 10,
    order: [["createdAt", "DESC"]],
    attributes: [
      "id",
      "orderNumber",
      "customerName",
      "total",
      "status",
      "createdAt",
    ],
  }),
]);

const totalSalesRows = await Order.findAll({
  where: {
    status: {
      [Op.in]: SALES_STATUSES,
    },
  },
  attributes: ["total"],
});

const totalSales = totalSalesRows.reduce(
  (sum, order) => {
    return sum + Number(order.total);
  },
  0,
);

const recentOrders: RecentOrder[] =
  recentOrderRows.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    total: Number(order.total),
    status: order.status,
    createdAt: order.createdAt,
  }));

const lowStockInventory =
  await Inventory.findAll({
    where: {
      quantity: {
        [Op.gte]: 0,
      },
    },
    include: [
      {
        model: ProductVariant,
        as: "variant",
        required: true,
        include: [
          {
            model: Product,
            as: "product",
            required: true,
            attributes: [
              "id",
              "name",
              "slug",
            ],
          },
        ],
      },
    ],
    order: [["quantity", "ASC"]],
  });

const lowStock =
  (
    lowStockInventory as InventoryWithRelations[]
  )
    .filter((inventory) => {
      const availableQuantity =
        inventory.quantity -
        inventory.reservedQuantity;

      return (
        availableQuantity <=
        inventory.lowStockThreshold
      );
    })
    .slice(0, 10)
    .map((inventory) => ({
      variantId: inventory.variantId,

      productName:
        inventory.variant?.product?.name ??
        "Unknown Product",

      sku:
        inventory.variant?.sku ??
        "N/A",

      color:
        inventory.variant?.color ??
        null,

      size:
        inventory.variant?.size ??
        null,

      quantity: inventory.quantity,

      reservedQuantity:
        inventory.reservedQuantity,

      availableQuantity:
        inventory.quantity -
        inventory.reservedQuantity,

      lowStockThreshold:
        inventory.lowStockThreshold,
    }));

return {
  overview: {
    totalSales,
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    processingOrders,
  },
  recentOrders,
  lowStock,
};

};