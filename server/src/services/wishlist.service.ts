import { sequelize } from "../config/database.js";
import {
  Product,
  Wishlist,
  WishlistItem,
} from "../models/index.js";

const wishlistInclude = [
  {
    model: WishlistItem,
    as: "items",
    include: [
      {
        model: Product,
        as: "product",
      },
    ],
  },
];

const getOrCreateWishlist = async (
  userId: string
) => {
  const [wishlist] =
    await Wishlist.findOrCreate({
      where: {
        userId,
      },
      defaults: {
        userId,
      },
    });

  return wishlist;
};

const getValidatedProduct = async (
  productId: string
) => {
  const product =
    await Product.findOne({
      where: {
        id: productId,
        isActive: true,
      },
    });

  if (!product) {
    throw new Error(
      "Product is not available"
    );
  }

  return product;
};

export const getWishlist = async (
  userId: string
) => {
  const wishlist =
    await getOrCreateWishlist(userId);

  return Wishlist.findByPk(
    wishlist.id,
    {
      include: wishlistInclude,
      order: [
        [
          {
            model: WishlistItem,
            as: "items",
          },
          "createdAt",
          "DESC",
        ],
      ],
    }
  );
};

export const addToWishlist = async (
  userId: string,
  productId: string
) => {
  return sequelize.transaction(
    async (transaction) => {
      await getValidatedProduct(
        productId
      );

      const wishlist =
        await getOrCreateWishlist(userId);

      const existingItem =
        await WishlistItem.findOne({
          where: {
            wishlistId: wishlist.id,
            productId,
          },
          transaction,
        });

      if (existingItem) {
        throw new Error(
          "Product is already in your wishlist"
        );
      }

      await WishlistItem.create(
        {
          wishlistId: wishlist.id,
          productId,
        },
        {
          transaction,
        }
      );

      return Wishlist.findByPk(
        wishlist.id,
        {
          include: wishlistInclude,
          transaction,
        }
      );
    }
  );
};

export const removeFromWishlist =
  async (
    userId: string,
    productId: string
  ) => {
    return sequelize.transaction(
      async (transaction) => {
        const wishlist =
          await Wishlist.findOne({
            where: {
              userId,
            },
            transaction,
          });

        if (!wishlist) {
          throw new Error(
            "Wishlist not found"
          );
        }

        const item =
          await WishlistItem.findOne({
            where: {
              wishlistId: wishlist.id,
              productId,
            },
            transaction,
          });

        if (!item) {
          throw new Error(
            "Product is not in your wishlist"
          );
        }

        await item.destroy({
          transaction,
        });

        return Wishlist.findByPk(
          wishlist.id,
          {
            include: wishlistInclude,
            transaction,
          }
        );
      }
    );
  };

export const clearWishlist = async (
  userId: string
) => {
  return sequelize.transaction(
    async (transaction) => {
      const wishlist =
        await Wishlist.findOne({
          where: {
            userId,
          },
          transaction,
        });

      if (!wishlist) {
        return null;
      }

      await WishlistItem.destroy({
        where: {
          wishlistId: wishlist.id,
        },
        transaction,
      });

      return Wishlist.findByPk(
        wishlist.id,
        {
          include: wishlistInclude,
          transaction,
        }
      );
    }
  );
};

export const isProductInWishlist =
  async (
    userId: string,
    productId: string
  ) => {
    const wishlist =
      await Wishlist.findOne({
        where: {
          userId,
        },
      });

    if (!wishlist) {
      return false;
    }

    const item =
      await WishlistItem.findOne({
        where: {
          wishlistId: wishlist.id,
          productId,
        },
      });

    return Boolean(item);
  };
