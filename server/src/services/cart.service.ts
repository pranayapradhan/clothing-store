import { Transaction } from "sequelize";
import { sequelize } from "../config/database.js";
import {
  Cart,
  CartItem,
  Inventory,
  Product,
  ProductVariant,
} from "../models/index.js";

const cartInclude = [
  {
    model: CartItem,
    as: "items",
    include: [
      {
        model: ProductVariant,
        as: "variant",
        include: [
          {
            model: Product,
            as: "product",
          },
          {
            model: Inventory,
            as: "inventory",
          },
        ],
      },
    ],
  },
];

const getOrCreateCart = async (
  userId: string
) => {
  const [cart] = await Cart.findOrCreate({
    where: { userId },
    defaults: {
      userId,
    },
  });

  return cart;
};

const getValidatedVariant = async (
  variantId: string,
  transaction: Transaction
) => {
  const variant =
    await ProductVariant.findOne({
      where: {
        id: variantId,
        isActive: true,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

  if (!variant) {
    throw new Error(
      "Product variant is not available"
    );
  }

  const product =
    await Product.findOne({
      where: {
        id: variant.productId,
        isActive: true,
      },
      transaction,
    });

  if (!product) {
    throw new Error(
      "Product is not available"
    );
  }

  const inventory =
    await Inventory.findOne({
      where: {
        variantId: variant.id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

  if (!inventory) {
    throw new Error(
      "Inventory has not been initialized for this variant"
    );
  }

  return {
    variant,
    inventory,
  };
};

export const getCart = async (
  userId: string
) => {
  const cart = await getOrCreateCart(userId);

  return Cart.findByPk(cart.id, {
    include: cartInclude,
  });
};

export const addToCart = async (
  userId: string,
  variantId: string,
  quantity: number
) => {
  return sequelize.transaction(
    async (transaction) => {
      const { variant, inventory } =
        await getValidatedVariant(
          variantId,
          transaction
        );

      const availableQuantity =
        inventory.quantity -
        inventory.reservedQuantity;

      const cart =
        await getOrCreateCart(userId);

      const existingItem =
        await CartItem.findOne({
          where: {
            cartId: cart.id,
            variantId,
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

      const newQuantity =
        (existingItem?.quantity ?? 0) +
        quantity;

      if (
        newQuantity > availableQuantity
      ) {
        throw new Error(
          `Only ${availableQuantity} item(s) are currently available`
        );
      }

      const price = variant.price;

      if (existingItem) {
        existingItem.quantity =
          newQuantity;

        existingItem.price = price;

        await existingItem.save({
          transaction,
        });
      } else {
        await CartItem.create(
          {
            cartId: cart.id,
            variantId,
            quantity,
            price,
          },
          {
            transaction,
          }
        );
      }

      return Cart.findByPk(cart.id, {
        include: cartInclude,
        transaction,
      });
    }
  );
};

export const updateCartItem = async (
  userId: string,
  itemId: string,
  quantity: number
) => {
  return sequelize.transaction(
    async (transaction) => {
      const cart = await Cart.findOne({
        where: {
          userId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      const item = await CartItem.findOne({
        where: {
          id: itemId,
          cartId: cart.id,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!item) {
        throw new Error(
          "Cart item not found"
        );
      }

      const { variant, inventory } =
        await getValidatedVariant(
          item.variantId,
          transaction
        );

      const availableQuantity =
        inventory.quantity -
        inventory.reservedQuantity;

      if (
        quantity > availableQuantity
      ) {
        throw new Error(
          `Only ${availableQuantity} item(s) are currently available`
        );
      }

      item.quantity = quantity;

      // Keep the cart price synchronized
      // with the current variant price.
      item.price = variant.price;

      await item.save({
        transaction,
      });

      return Cart.findByPk(cart.id, {
        include: cartInclude,
        transaction,
      });
    }
  );
};

export const removeCartItem = async (
  userId: string,
  itemId: string
) => {
  return sequelize.transaction(
    async (transaction) => {
      const cart = await Cart.findOne({
        where: {
          userId,
        },
        transaction,
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      const item = await CartItem.findOne({
        where: {
          id: itemId,
          cartId: cart.id,
        },
        transaction,
      });

      if (!item) {
        throw new Error(
          "Cart item not found"
        );
      }

      await item.destroy({
        transaction,
      });

      return Cart.findByPk(cart.id, {
        include: cartInclude,
        transaction,
      });
    }
  );
};

export const clearCart = async (
  userId: string
) => {
  return sequelize.transaction(
    async (transaction) => {
      const cart = await Cart.findOne({
        where: {
          userId,
        },
        transaction,
      });

      if (!cart) {
        return null;
      }

      await CartItem.destroy({
        where: {
          cartId: cart.id,
        },
        transaction,
      });

      return Cart.findByPk(cart.id, {
        include: cartInclude,
        transaction,
      });
    }
  );
};
