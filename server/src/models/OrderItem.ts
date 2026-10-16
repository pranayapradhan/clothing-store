import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class OrderItem extends Model<
  InferAttributes<OrderItem>,
  InferCreationAttributes<OrderItem>
> {
  declare id: CreationOptional<string>;

  declare orderId: string;
  declare variantId: string | null;

  declare productName: string;
  declare productSlug: string;
  declare productImage: string | null;

  declare color: string;
  declare size: string;
  declare sku: string;

  declare unitPrice: string;
  declare quantity: number;
  declare lineTotal: string;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "order_id",
    },

    variantId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "variant_id",
    },

    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: "product_name",
    },

    productSlug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      field: "product_slug",
    },

    productImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: "product_image",
    },

    color: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    size: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "unit_price",
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    lineTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "line_total",
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
    tableName: "order_items",
    timestamps: true,
    underscored: true,
  },
);


