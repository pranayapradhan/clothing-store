"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      throw new Error(
        "ADMIN_PASSWORD environment variable is required"
      );
    }

    if (password.length < 8) {
      throw new Error(
        "ADMIN_PASSWORD must be at least 8 characters"
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [existingAdmin] = await queryInterface.sequelize.query(
      `
        SELECT id
        FROM users
        WHERE email = :email
        LIMIT 1
      `,
      {
        replacements: {
          email: "admin@clothingstore.local",
        },
      }
    );

    if (existingAdmin.length > 0) {
      return;
    }

    await queryInterface.bulkInsert("users", [
      {
        id: queryInterface.sequelize.literal(
          "gen_random_uuid()"
        ),
        name: "Store Admin",
        email: "admin@clothingstore.local",
        password_hash: passwordHash,
        role: "ADMIN",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: "admin@clothingstore.local",
    });
  },
};