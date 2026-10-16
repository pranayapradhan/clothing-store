"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("inventory", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },

      variant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "product_variants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      reserved_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      low_stock_threshold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addConstraint("inventory", {
      fields: ["variant_id"],
      type: "unique",
      name: "inventory_variant_id_unique",
    });

    await queryInterface.addIndex("inventory", ["variant_id"], {
      name: "inventory_variant_id_index",
    });

    await queryInterface.addIndex(
      "inventory",
      ["quantity"],
      {
        name: "inventory_quantity_index",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("inventory");
  },
};