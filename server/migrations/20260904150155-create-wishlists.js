"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wishlists", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal(
          "gen_random_uuid()"
        ),
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
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
    });

    await queryInterface.addConstraint(
      "wishlists",
      {
        fields: ["user_id"],
        type: "unique",
        name: "wishlists_user_id_unique",
      }
    );

    await queryInterface.addIndex(
      "wishlists",
      ["user_id"],
      {
        name: "wishlists_user_id_idx",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wishlists");
  },
};
