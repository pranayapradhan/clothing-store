import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../config/database.js";

export class Conversation extends Model<
  InferAttributes<Conversation>,
  InferCreationAttributes<Conversation>
> {
  declare id: CreationOptional<string>;
  declare customerId: string;
  declare lastMessageAt: CreationOptional<Date | null>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Conversation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: "customer_id",
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: "last_message_at",
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
    tableName: "conversations",
    modelName: "Conversation",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["customer_id"],
      },
      {
        fields: ["last_message_at"],
      },
    ],
  },
);
