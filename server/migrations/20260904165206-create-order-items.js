const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("order_items", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      variant_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "product_variants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      product_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      product_slug: {
        type: DataTypes.STRING(220),
        allowNull: false,
      },

      product_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      color: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      size: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },

      sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      line_total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addIndex("order_items", ["order_id"], {
      name: "order_items_order_id_idx",
    });

    await queryInterface.addIndex("order_items", ["variant_id"], {
      name: "order_items_variant_id_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("order_items");
  },
};
