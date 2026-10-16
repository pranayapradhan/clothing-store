"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn(
      "product_variants",
      "stock"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      "product_variants",
      "stock",
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    );
  },
};