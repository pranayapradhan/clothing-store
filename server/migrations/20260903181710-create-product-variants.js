"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("product_variants", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },

      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      color: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      color_code: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },

      size: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },

      sku: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Every SKU must be globally unique.
    await queryInterface.addIndex("product_variants", ["sku"], {
      unique: true,
      name: "product_variants_sku_unique",
    });

    // Quickly find all variants belonging to a product.
    await queryInterface.addIndex("product_variants", ["product_id"], {
      name: "product_variants_product_id_index",
    });

    // Useful for filtering available variants.
    await queryInterface.addIndex(
      "product_variants",
      ["product_id", "is_active"],
      {
        name: "product_variants_product_active_index",
      }
    );

    // Prevent duplicate combinations such as:
    // Black + M for the same product appearing twice.
    await queryInterface.addIndex(
      "product_variants",
      ["product_id", "color", "size"],
      {
        unique: true,
        name: "product_variants_product_color_size_unique",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("product_variants");
  },
};