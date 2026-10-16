import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/database.js";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type CancelledBy = "USER" | "ADMIN";
export type PaymentMethod = "COD";

export type PaymentStatus = "PENDING" | "PAID";

export class Order extends Model<
  InferAttributes<Order>,
  InferCreationAttributes<Order>
> {
  declare id: CreationOptional<string>;
  declare userId: string;
  declare orderNumber: string;

  declare status: CreationOptional<OrderStatus>;
  declare paymentMethod: CreationOptional<PaymentMethod>;
  declare paymentStatus: CreationOptional<PaymentStatus>;

  declare customerName: string;
  declare customerEmail: string;
  declare customerPhone: string;

  declare shippingAddressLine1: string;
  declare shippingAddressLine2: string | null;
  declare shippingCity: string;
  declare shippingState: string | null;
  declare shippingPostalCode: string | null;
  declare shippingCountry: CreationOptional<string>;

  declare notes: string | null;

  declare subtotal: string;
  declare deliveryCharge: string;
  declare discount: string;
  declare total: string;

  declare cancelledAt: Date | null;
declare cancellationReason: string | null;
declare cancelledBy: CancelledBy | null;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },

    orderNumber: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
      field: "order_number",
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    paymentMethod: {
      type: DataTypes.ENUM("COD"),
      allowNull: false,
      defaultValue: "COD",
      field: "payment_method",
    },

    paymentStatus: {
      type: DataTypes.ENUM("PENDING", "PAID"),
      allowNull: false,
      defaultValue: "PENDING",
      field: "payment_status",
    },

    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "customer_name",
    },

    customerEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "customer_email",
    },

    customerPhone: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: "customer_phone",
    },

    shippingAddressLine1: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "shipping_address_line1",
    },

    shippingAddressLine2: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "shipping_address_line2",
    },

    shippingCity: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "shipping_city",
    },

    shippingState: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "shipping_state",
    },

    shippingPostalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "shipping_postal_code",
    },

    shippingCountry: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Nepal",
      field: "shipping_country",
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    deliveryCharge: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "delivery_charge",
    },

    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cancelledAt: {
type: DataTypes.DATE,
allowNull: true,
field: "cancelled_at",
},

cancellationReason: {
type: DataTypes.STRING(255),
allowNull: true,
field: "cancellation_reason",
},

cancelledBy: {
type: DataTypes.ENUM("USER", "ADMIN"),
allowNull: true,
field: "cancelled_by",
},


    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "created_at",
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
    underscored: true,
  },
);
