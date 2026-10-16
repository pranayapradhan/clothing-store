import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../config/database.js";

export class Inventory extends Model<
  InferAttributes<Inventory>,
  InferCreationAttributes<Inventory>
> {
  declare id: CreationOptional<string>;

  declare variantId: string;

  declare quantity: CreationOptional<number>;
  declare reservedQuantity: CreationOptional<number>;
  declare lowStockThreshold: CreationOptional<number>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Inventory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    variantId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: "variant_id",
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    reservedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "reserved_quantity",
      validate: {
        min: 0,
      },
    },

    lowStockThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      field: "low_stock_threshold",
      validate: {
        min: 0,
      },
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
    tableName: "inventory",
    modelName: "Inventory",
    timestamps: true,
  }
);