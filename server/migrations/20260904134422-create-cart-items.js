"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "cart_items",
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal(
            "gen_random_uuid()"
          ),
          primaryKey: true,
          allowNull: false,
        },

        cart_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "carts",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
          defaultValue: 1,
        },

        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP"
          ),
        },

        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP"
          ),
        },
      }
    );

    await queryInterface.addConstraint(
      "cart_items",
      {
        fields: ["quantity"],
        type: "check",
        where: {
          quantity: {
            [Sequelize.Op.gte]: 1,
          },
        },
        name: "cart_items_quantity_positive",
      }
    );

    await queryInterface.addConstraint(
      "cart_items",
      {
        fields: ["price"],
        type: "check",
        where: {
          price: {
            [Sequelize.Op.gte]: 0,
          },
        },
        name: "cart_items_price_non_negative",
      }
    );

    await queryInterface.addConstraint(
      "cart_items",
      {
        fields: ["cart_id", "variant_id"],
        type: "unique",
        name: "cart_items_cart_variant_unique",
      }
    );

    await queryInterface.addIndex(
      "cart_items",
      ["cart_id"],
      {
        name: "cart_items_cart_id_index",
      }
    );

    await queryInterface.addIndex(
      "cart_items",
      ["variant_id"],
      {
        name: "cart_items_variant_id_index",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "cart_items"
    );
  },
};
