import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "../config/database.js";

export type ChatAttachmentType = "IMAGE" | "FILE";

export class ChatMessage extends Model<
  InferAttributes<ChatMessage>,
  InferCreationAttributes<ChatMessage>
> {
  declare id: CreationOptional<string>;
  declare conversationId: string;
  declare senderId: string;

  declare message: string;
  declare attachmentType: CreationOptional<ChatAttachmentType | null>;
  declare attachmentName: CreationOptional<string | null>;
  declare attachmentUrl: CreationOptional<string | null>;
  declare attachmentPublicId: CreationOptional<string | null>;
  declare attachmentMimeType: CreationOptional<string | null>;
  declare attachmentSize: CreationOptional<number | null>;

  declare readAt: CreationOptional<Date | null>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

ChatMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "conversation_id",
      references: {
        model: "conversations",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "sender_id",
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
      validate: {
        len: [0, 5000],
      },
    },

    attachmentType: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null,
      field: "attachment_type",
      validate: {
        isIn: [["IMAGE", "FILE"]],
      },
    },

    attachmentName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "attachment_name",
    },

    attachmentUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "attachment_url",
    },

    attachmentPublicId: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "attachment_public_id",
    },

    attachmentMimeType: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: "attachment_mime_type",
    },

    attachmentSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "attachment_size",
    },

    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: "read_at",
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
    tableName: "chat_messages",
    modelName: "ChatMessage",
    timestamps: true,
    indexes: [
      { fields: ["conversation_id", "created_at"] },
      { fields: ["sender_id"] },
      { fields: ["conversation_id", "read_at"] },
    ],
    validate: {
      messageOrAttachment(this: ChatMessage) {
        const hasMessage =
          typeof this.message === "string" && this.message.trim().length > 0;

        const hasAttachment =
          typeof this.attachmentPublicId === "string" &&
          this.attachmentPublicId.trim().length > 0;

        if (!hasMessage && !hasAttachment) {
          throw new Error("A message must contain text or an attachment");
        }
      },
    },
  },
);
