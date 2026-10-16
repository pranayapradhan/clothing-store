"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "main_image_public_id", {
      type: Sequelize.STRING(500),
      allowNull: true,
    });

    await queryInterface.addColumn("products", "image_public_ids", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("products", "image_public_ids");

    await queryInterface.removeColumn("products", "main_image_public_id");
  },
};
