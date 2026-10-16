"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },

      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },

      slug: {
        type: Sequelize.STRING(220),
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      brand: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      base_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },

      discount_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      main_image: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      images: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
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

    await queryInterface.addIndex("products", ["slug"], {
      unique: true,
      name: "products_slug_unique",
    });

    await queryInterface.addIndex("products", ["category_id"], {
      name: "products_category_id_index",
    });

    await queryInterface.addIndex("products", ["is_active"], {
      name: "products_is_active_index",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("products");
  },
};