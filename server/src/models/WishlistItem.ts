import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../config/database.js";

export class WishlistItem extends Model<
  InferAttributes<WishlistItem>,
  InferCreationAttributes<WishlistItem>
> {
  declare id: CreationOptional<string>;

  declare wishlistId: string;

  declare productId: string;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

WishlistItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    wishlistId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "wishlist_id",
    },

    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "product_id",
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
    tableName: "wishlist_items",
    modelName: "WishlistItem",
    timestamps: true,
  }
);
