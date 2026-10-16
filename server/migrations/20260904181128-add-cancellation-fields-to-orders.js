import { DataTypes } from "sequelize";

export default {
async up(queryInterface) {
await queryInterface.addColumn("orders", "cancelled_at", {
type: DataTypes.DATE,
allowNull: true,
});


await queryInterface.addColumn("orders", "cancellation_reason", {
  type: DataTypes.STRING(255),
  allowNull: true,
});

await queryInterface.addColumn("orders", "cancelled_by", {
  type: DataTypes.ENUM("USER", "ADMIN"),
  allowNull: true,
});


},

async down(queryInterface) {
await queryInterface.removeColumn(
"orders",
"cancelled_by",
);


await queryInterface.removeColumn(
  "orders",
  "cancellation_reason",
);

await queryInterface.removeColumn(
  "orders",
  "cancelled_at",
);

await queryInterface.sequelize.query(
  'DROP TYPE IF EXISTS "enum_orders_cancelled_by";',
);


},
};
