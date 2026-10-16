"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("categories", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      slug: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      image: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex("categories", ["slug"], {
      unique: true,
      name: "categories_slug_unique",
    });

    await queryInterface.addIndex("categories", ["parent_id"], {
      name: "categories_parent_id_index",
    });

    await queryInterface.addIndex("categories", ["is_active"], {
      name: "categories_is_active_index",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("categories");
  },
};