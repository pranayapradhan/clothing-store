import { Op, Transaction } from "sequelize";

import { sequelize } from "../config/database.js";
import { Inventory, ProductVariant } from "../models/index.js";

export interface SetInventoryInput {
  quantity: number;
  lowStockThreshold?: number;
}

export interface AdjustInventoryInput {
  quantity: number;
}

export interface ReserveInventoryInput {
  quantity: number;
}

export interface ReleaseInventoryInput {
  quantity: number;
}

export interface InitializeInventoryInput {
  quantity: number;
  lowStockThreshold?: number;
}

const getVariant = async (
  variantId: string,
  transaction?: Transaction
): Promise<ProductVariant> => {
  const variant = await ProductVariant.findOne({
    where: {
      id: variantId,
      isActive: true,
    },
    transaction,
  });

  if (!variant) {
    throw new Error("Product variant not found or inactive");
  }

  return variant;
};

const getOrCreateInventory = async (
  variantId: string,
  transaction: Transaction
): Promise<Inventory> => {
  let inventory = await Inventory.findOne({
    where: {
      variantId,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!inventory) {
    inventory = await Inventory.create(
      {
        variantId,
        quantity: 0,
        reservedQuantity: 0,
        lowStockThreshold: 5,
      },
      { transaction }
    );
  }

  return inventory;
};

export const getVariantAvailability = async (
  variantId: string
) => {
  const inventory = await getInventoryByVariantId(variantId);

  if (!inventory) {
    return {
      available: false,
      availableQuantity: 0,
    };
  }

  const availableQuantity =
    inventory.quantity - inventory.reservedQuantity;

  return {
    available: availableQuantity > 0,
    availableQuantity,
  };
};

export const getInventoryByVariantId = async (
  variantId: string
): Promise<Inventory | null> => {
  await getVariant(variantId);

  return Inventory.findOne({
    where: {
      variantId,
    },
    include: [
      {
        model: ProductVariant,
        as: "variant",
        attributes: [
          "id",
          "productId",
          "color",
          "size",
          "sku",
          "price",
        ],
      },
    ],
  });
};

export const initializeInventory = async (
  variantId: string,
  input: InitializeInventoryInput
): Promise<Inventory> => {
  const transaction = await sequelize.transaction();

  try {
    await getVariant(variantId, transaction);

    const existingInventory = await Inventory.findOne({
      where: {
        variantId,
      },
      transaction,
    });

    if (existingInventory) {
      throw new Error(
        "Inventory already exists for this variant"
      );
    }

    const inventory = await Inventory.create(
      {
        variantId,
        quantity: input.quantity,
        reservedQuantity: 0,
        lowStockThreshold:
          input.lowStockThreshold ?? 5,
      },
      { transaction }
    );

    await transaction.commit();

    return inventory;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const setInventory = async (
  variantId: string,
  input: SetInventoryInput
): Promise<Inventory> => {
  const transaction = await sequelize.transaction();

  try {
    await getVariant(variantId, transaction);

    const inventory = await getOrCreateInventory(
      variantId,
      transaction
    );

    if (input.quantity < inventory.reservedQuantity) {
      throw new Error(
        "Quantity cannot be less than reserved quantity"
      );
    }

    await inventory.update(
      {
        quantity: input.quantity,
        lowStockThreshold:
          input.lowStockThreshold ??
          inventory.lowStockThreshold,
      },
      { transaction }
    );

    await transaction.commit();

    return inventory;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const adjustInventory = async (
  variantId: string,
  input: AdjustInventoryInput
): Promise<Inventory> => {
  const transaction = await sequelize.transaction();

  try {
    await getVariant(variantId, transaction);

    const inventory = await getOrCreateInventory(
      variantId,
      transaction
    );

    const newQuantity =
      inventory.quantity + input.quantity;

    if (newQuantity < 0) {
      throw new Error("Inventory quantity cannot be negative");
    }

    if (newQuantity < inventory.reservedQuantity) {
      throw new Error(
        "Quantity cannot be less than reserved quantity"
      );
    }

    await inventory.update(
      {
        quantity: newQuantity,
      },
      { transaction }
    );

    await transaction.commit();

    return inventory;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const reserveInventory = async (
  variantId: string,
  input: ReserveInventoryInput
): Promise<Inventory> => {
  const transaction = await sequelize.transaction();

  try {
    await getVariant(variantId, transaction);

    const inventory = await getOrCreateInventory(
      variantId,
      transaction
    );

    const availableQuantity =
      inventory.quantity -
      inventory.reservedQuantity;

    if (input.quantity > availableQuantity) {
      throw new Error("Insufficient available stock");
    }

    await inventory.update(
      {
        reservedQuantity:
          inventory.reservedQuantity + input.quantity,
      },
      { transaction }
    );

    await transaction.commit();

    return inventory;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const releaseInventory = async (
  variantId: string,
  input: ReleaseInventoryInput
): Promise<Inventory> => {
  const transaction = await sequelize.transaction();

  try {
    await getVariant(variantId, transaction);

    const inventory = await getOrCreateInventory(
      variantId,
      transaction
    );

    if (input.quantity > inventory.reservedQuantity) {
      throw new Error(
        "Release quantity cannot exceed reserved quantity"
      );
    }

    await inventory.update(
      {
        reservedQuantity:
          inventory.reservedQuantity - input.quantity,
      },
      { transaction }
    );

    await transaction.commit();

    return inventory;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getLowStockInventory = async (): Promise<
  Inventory[]
> => {
  return Inventory.findAll({
    where: {
      quantity: {
        [Op.lte]: sequelize.col("low_stock_threshold"),
      },
    },
    include: [
      {
        model: ProductVariant,
        as: "variant",
        attributes: [
          "id",
          "productId",
          "color",
          "size",
          "sku",
        ],
      },
    ],
    order: [["quantity", "ASC"]],
  });
};

