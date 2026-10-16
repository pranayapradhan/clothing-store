"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "wishlist_items",
      {
        id: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: Sequelize.literal(
            "gen_random_uuid()"
          ),
        },

        wishlist_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: "wishlists",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
      "wishlist_items",
      {
        fields: [
          "wishlist_id",
          "product_id",
        ],
        type: "unique",
        name: "wishlist_items_wishlist_product_unique",
      }
    );

    await queryInterface.addIndex(
      "wishlist_items",
      ["wishlist_id"],
      {
        name: "wishlist_items_wishlist_id_idx",
      }
    );

    await queryInterface.addIndex(
      "wishlist_items",
      ["product_id"],
      {
        name: "wishlist_items_product_id_idx",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      "wishlist_items"
    );
  },
};
