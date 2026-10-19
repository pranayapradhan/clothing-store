
import { Op, fn, col } from "sequelize";
import { User, Order } from "../models/index.js";

interface CustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
}

const customerAttributes = [
  "id",
  "name",
  "email",
  "role",
  "isActive",
  "createdAt",
  "updatedAt",
];

export const getAdminCustomers = async (
  filters: CustomerFilters = {},
) => {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const offset = (page - 1) * limit;

  const search = filters.search?.trim();

  const where = {
    role: "USER",
    ...(search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : {}),
  };

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: customerAttributes,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  const customerIds = rows.map((customer) => customer.id);

  const orderStats =
    customerIds.length > 0
      ? await Order.findAll({
          where: {
            userId: {
              [Op.in]: customerIds,
            },
          },
          attributes: [
            "userId",
            [fn("COUNT", col("id")), "totalOrders"],
          ],
          group: ["userId"],
          raw: true,
        })
      : [];

  const statsMap = new Map<string, number>();

  for (const stat of orderStats) {
    const row = stat as unknown as {
      userId: string;
      totalOrders: string;
    };

    statsMap.set(row.userId, Number(row.totalOrders));
  }

  return {
    customers: rows.map((customer) => ({
      ...customer.get({ plain: true }),
      totalOrders: statsMap.get(customer.id) ?? 0,
    })),
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

export const getAdminCustomerById = async (
  customerId: string,
) => {
  const customer = await User.findOne({
    where: {
      id: customerId,
      role: "USER",
    },
    attributes: customerAttributes,
  });

  if (!customer) {
    return null;
  }

  const orders = await Order.findAll({
    where: {
      userId: customerId,
    },
    attributes: [
      "id",
      "orderNumber",
      "status",
      "paymentMethod",
      "paymentStatus",
      "total",
      "createdAt",
    ],
    order: [["createdAt", "DESC"]],
  });

  const totalOrders = orders.length;

  const totalSpent = orders
    .filter(
      (order) =>
        order.status === "DELIVERED" &&
        order.paymentStatus === "PAID",
    )
    .reduce((sum, order) => sum + Number(order.total), 0);

  return {
    ...customer.get({ plain: true }),
    totalOrders,
    totalSpent,
    orders,
  };
};
