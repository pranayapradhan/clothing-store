import { Op, type WhereOptions } from "sequelize";

import { sequelize } from "../config/database.js";
import { Category, Product, ProductVariant } from "../models/index.js";

export interface CreateProductInput {
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  brand?: string | null;
  basePrice: number | string;
  discountPrice?: number | string | null;

  mainImage?: string | null;
  mainImagePublicId?: string | null;

  images?: string[];
  imagePublicIds?: string[];

  isActive?: boolean;
}

export interface UpdateProductInput {
  categoryId?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  brand?: string | null;
  basePrice?: number | string;
  discountPrice?: number | string | null;

  mainImage?: string | null;
  mainImagePublicId?: string | null;

  images?: string[];
  imagePublicIds?: string[];

  isActive?: boolean;
}

export interface CreateProductVariantInput {
  productId: string;
  color: string;
  colorCode?: string | null;
  size: string;
  sku: string;
  price: number | string;
  isActive?: boolean;
}

export interface UpdateProductVariantInput {
  color?: string;
  colorCode?: string | null;
  size?: string;
  sku?: string;
  price?: number | string;
  isActive?: boolean;
}

export interface GetProductsOptions {
  categorySlug?: string;
  search?: string;
}

export interface GetAdminProductsOptions {
  search?: string;
  status?: "all" | "active" | "inactive";
  page?: number;
  limit?: number;
}

const normalizeText = (value: string): string => value.trim();

const normalizeSlug = (value: string): string => value.trim().toLowerCase();

const normalizeSku = (value: string): string => value.trim().toUpperCase();

const validatePrices = (
  basePrice: number | string,
  discountPrice?: number | string | null,
): void => {
  const base = Number(basePrice);

  if (!Number.isFinite(base) || base < 0) {
    throw new Error("Base price must be a valid non-negative number");
  }

  if (discountPrice !== undefined && discountPrice !== null) {
    const discount = Number(discountPrice);

    if (!Number.isFinite(discount) || discount < 0) {
      throw new Error("Discount price must be a valid non-negative number");
    }

    if (discount > base) {
      throw new Error("Discount price cannot be greater than base price");
    }
  }
};

export const createProduct = async (
  input: CreateProductInput,
): Promise<Product> => {
  const transaction = await sequelize.transaction();

  try {
    const slug = normalizeSlug(input.slug);
    const name = normalizeText(input.name);

    const category = await Category.findByPk(input.categoryId, {
      transaction,
    });

    if (!category || !category.isActive) {
      throw new Error("Category not found or inactive");
    }

    const existingProduct = await Product.findOne({
      where: {
        [Op.or]: [
          {
            name,
          },
          {
            slug,
          },
        ],
      },
      transaction,
    });

    if (existingProduct) {
      throw new Error("Product name or slug already exists");
    }

    validatePrices(input.basePrice, input.discountPrice);

    const product = await Product.create(
      {
        categoryId: input.categoryId,
        name,
        slug,
        description: input.description?.trim() ?? null,
        brand: input.brand?.trim() ?? null,
        basePrice: String(input.basePrice),
        discountPrice:
          input.discountPrice !== undefined && input.discountPrice !== null
            ? String(input.discountPrice)
            : null,
        mainImage: input.mainImage ?? null,
        mainImagePublicId: input.mainImagePublicId ?? null,

        images: input.images ?? [],
        imagePublicIds: input.imagePublicIds ?? [],
        isActive: input.isActive ?? true,
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    return product;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getProducts = async (
  categorySlug?: string,
  search?: string,
  brand?: string,
  size?: string,
  color?: string,
  minPrice?: number,
  maxPrice?: number,
  page = 1,
  limit = 12,
) => {
  // ==================== PAGINATION ====================

  const safePage = Math.max(1, page);

  const safeLimit = Math.min(Math.max(1, limit), 50);

  const offset = (safePage - 1) * safeLimit;

  // ==================== CATEGORY FILTER ====================

  const categoryWhere = categorySlug
    ? {
        slug: categorySlug,
        isActive: true,
      }
    : undefined;

  // ==================== PRODUCT FILTER ====================

  const productWhere: WhereOptions = {
    isActive: true,

    ...(search
      ? {
          [Op.or]: [
            {
              name: {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              brand: {
                [Op.iLike]: `%${search}%`,
              },
            },
            {
              description: {
                [Op.iLike]: `%${search}%`,
              },
            },
          ],
        }
      : {}),

    ...(brand
      ? {
          brand: {
            [Op.iLike]: `%${brand}%`,
          },
        }
      : {}),
  };

  // ==================== VARIANT FILTER ====================

  const variantWhere: WhereOptions = {
    isActive: true,

    ...(size
      ? {
          size: {
            [Op.iLike]: size,
          },
        }
      : {}),

    ...(color
      ? {
          color: {
            [Op.iLike]: color,
          },
        }
      : {}),

    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined && {
              [Op.gte]: minPrice,
            }),

            ...(maxPrice !== undefined && {
              [Op.lte]: maxPrice,
            }),
          },
        }
      : {}),
  };

  // ==================== QUERY ====================

  const { rows, count } = await Product.findAndCountAll({
    where: productWhere,

    include: [
      {
        model: Category,
        as: "category",

        ...(categoryWhere && {
          where: categoryWhere,
          required: true,
        }),
      },

      {
        model: ProductVariant,
        as: "variants",
        where: variantWhere,

        required:
          Boolean(size) ||
          Boolean(color) ||
          minPrice !== undefined ||
          maxPrice !== undefined,
      },
    ],

    order: [["createdAt", "DESC"]],

    limit: safeLimit,
    offset,

    distinct: true,
  });

  // ==================== PAGINATION ====================

  const totalPages = Math.ceil(count / safeLimit);

  return {
    products: rows,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count,
      totalPages,

      hasNextPage: safePage < totalPages,

      hasPreviousPage: safePage > 1,
    },
  };
};

export const getProductById = async (
  productId: string,
): Promise<Product | null> => {
  return Product.findOne({
    where: {
      id: productId,
      isActive: true,
    },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name", "slug"],
      },
      {
        model: ProductVariant,
        as: "variants",
        where: {
          isActive: true,
        },
        required: false,
      },
    ],
  });
};

export const getProductBySlug = async (
  slug: string,
): Promise<Product | null> => {
  return Product.findOne({
    where: {
      slug: normalizeSlug(slug),
      isActive: true,
    },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name", "slug"],
      },
      {
        model: ProductVariant,
        as: "variants",
        where: {
          isActive: true,
        },
        required: false,
      },
    ],
  });
};

export const getAdminProducts = async (
  options: GetAdminProductsOptions = {},
) => {
  const { search, status = "all", page = 1, limit = 20 } = options;

  const safePage = Math.max(1, page);

  const safeLimit = Math.min(Math.max(1, limit), 50);

  const offset = (safePage - 1) * safeLimit;

  const productWhere: WhereOptions = {};

  // ==================== STATUS FILTER ====================

  if (status === "active") {
    productWhere.isActive = true;
  }

  if (status === "inactive") {
    productWhere.isActive = false;
  }

  // ==================== SEARCH ====================

  if (search?.trim()) {
    const searchValue = search.trim();

    const productWhere: WhereOptions = {
      ...(status === "active" && {
        isActive: true,
      }),

      ...(status === "inactive" && {
        isActive: false,
      }),

      ...(search?.trim() && {
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${search.trim()}%`,
            },
          },
          {
            brand: {
              [Op.iLike]: `%${search.trim()}%`,
            },
          },
          {
            slug: {
              [Op.iLike]: `%${search.trim()}%`,
            },
          },
        ],
      }),
    };
  }

  // ==================== QUERY ====================

  const { rows, count } = await Product.findAndCountAll({
    where: productWhere,

    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name", "slug"],
      },

      {
        model: ProductVariant,
        as: "variants",
        required: false,
      },
    ],

    order: [["createdAt", "DESC"]],

    limit: safeLimit,
    offset,

    distinct: true,
  });

  // ==================== PAGINATION ====================

  const totalPages = Math.ceil(count / safeLimit);

  return {
    products: rows,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count,
      totalPages,

      hasNextPage: safePage < totalPages,

      hasPreviousPage: safePage > 1,
    },
  };
};

export const updateProduct = async (
  productId: string,
  input: UpdateProductInput,
): Promise<Product> => {
  const transaction = await sequelize.transaction();

  try {
    const product = await Product.findByPk(productId, {
      transaction,
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const categoryId = input.categoryId ?? product.categoryId;
    const name =
      input.name !== undefined ? normalizeText(input.name) : product.name;

    const slug =
      input.slug !== undefined ? normalizeSlug(input.slug) : product.slug;

    if (input.categoryId !== undefined) {
      const category = await Category.findByPk(categoryId, {
        transaction,
      });

      if (!category || !category.isActive) {
        throw new Error("Category not found or inactive");
      }
    }

    const duplicateProduct = await Product.findOne({
      where: {
        id: {
          [Op.ne]: productId,
        },
        [Op.or]: [
          {
            name,
          },
          {
            slug,
          },
        ],
      },
      transaction,
    });

    if (duplicateProduct) {
      throw new Error("Product name or slug already exists");
    }

    const basePrice =
      input.basePrice !== undefined ? input.basePrice : product.basePrice;

    const discountPrice =
      input.discountPrice !== undefined
        ? input.discountPrice
        : product.discountPrice;

    validatePrices(basePrice, discountPrice);

    await product.update(
      {
        categoryId,
        name,
        slug,
        description:
          input.description !== undefined
            ? (input.description?.trim() ?? null)
            : product.description,
        brand:
          input.brand !== undefined
            ? (input.brand?.trim() ?? null)
            : product.brand,
        basePrice: String(basePrice),
        discountPrice:
          discountPrice !== null && discountPrice !== undefined
            ? String(discountPrice)
            : null,
        mainImage:
          input.mainImage !== undefined ? input.mainImage : product.mainImage,

        mainImagePublicId:
          input.mainImagePublicId !== undefined
            ? input.mainImagePublicId
            : product.mainImagePublicId,

        images: input.images !== undefined ? input.images : product.images,

        imagePublicIds:
          input.imagePublicIds !== undefined
            ? input.imagePublicIds
            : product.imagePublicIds,
        isActive:
          input.isActive !== undefined ? input.isActive : product.isActive,
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    return product;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deactivateProduct = async (
  productId: string,
): Promise<Product> => {
  const product = await Product.findByPk(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  await product.update({
    isActive: false,
  });

  return product;
};

export const activateProduct = async (productId: string): Promise<Product> => {
  const product = await Product.findByPk(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  await product.update({
    isActive: true,
  });

  return product;
};

export const getAdminProductById = async (
  productId: string,
): Promise<Product | null> => {
  return Product.findOne({
    where: {
      id: productId,
    },
    include: [
      {
        model: Category,
        as: "category",
        attributes: ["id", "name", "slug"],
      },
      {
        model: ProductVariant,
        as: "variants",
        required: false,
      },
    ],
  });
};

export const createProductVariant = async (
  input: CreateProductVariantInput,
): Promise<ProductVariant> => {
  const product = await Product.findOne({
    where: {
      id: input.productId,
      isActive: true,
    },
  });

  if (!product) {
    throw new Error("Product not found or inactive");
  }

  const sku = normalizeSku(input.sku);
  const color = normalizeText(input.color);
  const size = normalizeText(input.size);

  const price = Number(input.price);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Variant price must be a valid non-negative number");
  }

  const existingSku = await ProductVariant.findOne({
    where: {
      sku,
    },
  });

  if (existingSku) {
    throw new Error("SKU already exists");
  }

  const existingCombination = await ProductVariant.findOne({
    where: {
      productId: input.productId,
      color,
      size,
    },
  });

  if (existingCombination) {
    throw new Error("A variant with this color and size already exists");
  }

  return ProductVariant.create({
    productId: input.productId,
    color,
    colorCode: input.colorCode ?? null,
    size,
    sku,
    price: String(input.price),
    isActive: input.isActive ?? true,
  });
};

export const getProductVariantById = async (
  variantId: string,
): Promise<ProductVariant | null> => {
  return ProductVariant.findOne({
    where: {
      id: variantId,
      isActive: true,
    },
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["id", "name", "slug"],
      },
    ],
  });
};

export const updateProductVariant = async (
  variantId: string,
  input: UpdateProductVariantInput,
): Promise<ProductVariant> => {
  const transaction = await sequelize.transaction();

  try {
    const variant = await ProductVariant.findByPk(variantId, {
      transaction,
    });

    if (!variant) {
      throw new Error("Product variant not found");
    }

    const color =
      input.color !== undefined ? normalizeText(input.color) : variant.color;

    const size =
      input.size !== undefined ? normalizeText(input.size) : variant.size;

    const sku = input.sku !== undefined ? normalizeSku(input.sku) : variant.sku;

    const price =
      input.price !== undefined ? Number(input.price) : Number(variant.price);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Variant price must be a valid non-negative number");
    }

    const duplicateSku = await ProductVariant.findOne({
      where: {
        id: {
          [Op.ne]: variantId,
        },
        sku,
      },
      transaction,
    });

    if (duplicateSku) {
      throw new Error("SKU already exists");
    }

    const duplicateCombination = await ProductVariant.findOne({
      where: {
        id: {
          [Op.ne]: variantId,
        },
        productId: variant.productId,
        color,
        size,
      },
      transaction,
    });

    if (duplicateCombination) {
      throw new Error("A variant with this color and size already exists");
    }

    await variant.update(
      {
        color,
        colorCode:
          input.colorCode !== undefined ? input.colorCode : variant.colorCode,
        size,
        sku,
        price: String(input.price ?? variant.price),
        isActive:
          input.isActive !== undefined ? input.isActive : variant.isActive,
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    return variant;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deactivateProductVariant = async (
  variantId: string,
): Promise<ProductVariant> => {
  const variant = await ProductVariant.findByPk(variantId);

  if (!variant) {
    throw new Error("Product variant not found");
  }

  await variant.update({
    isActive: false,
  });

  return variant;
};
