
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("chat_messages", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },

      conversation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "conversations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      sender_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex(
      "chat_messages",
      ["conversation_id", "created_at"],
      {
        name: "chat_messages_conversation_created_idx",
      },
    );

    await queryInterface.addIndex(
      "chat_messages",
      ["sender_id"],
      {
        name: "chat_messages_sender_idx",
      },
    );

    await queryInterface.addIndex(
      "chat_messages",
      ["conversation_id", "read_at"],
      {
        name: "chat_messages_conversation_read_idx",
      },
    );

    await queryInterface.addConstraint("chat_messages", {
      fields: ["message"],
      type: "check",
      name: "chat_messages_length_check",
      where: {
        message: {
          [Sequelize.Op.and]: [
            { [Sequelize.Op.ne]: "" },
          ],
        },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("chat_messages");
  },
};
