const { DataTypes } = require("sequelize");

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("orders", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      order_number: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
      },

      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "CONFIRMED",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },

      payment_method: {
        type: DataTypes.ENUM("COD"),
        allowNull: false,
        defaultValue: "COD",
      },

      payment_status: {
        type: DataTypes.ENUM("PENDING", "PAID"),
        allowNull: false,
        defaultValue: "PENDING",
      },

      customer_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      customer_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      customer_phone: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },

      shipping_address_line1: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      shipping_address_line2: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      shipping_city: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      shipping_state: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      shipping_postal_code: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      shipping_country: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "Nepal",
      },

      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      delivery_charge: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      discount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },

      total: {
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

    await queryInterface.addIndex("orders", ["user_id"], {
      name: "orders_user_id_idx",
    });

    await queryInterface.addIndex("orders", ["status"], {
      name: "orders_status_idx",
    });

    await queryInterface.addIndex("orders", ["created_at"], {
      name: "orders_created_at_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("orders");

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_orders_status";',
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_orders_payment_method";',
    );

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_orders_payment_status";',
    );
  },
};
