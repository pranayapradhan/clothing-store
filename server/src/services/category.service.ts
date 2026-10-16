import { Op } from "sequelize";

import { Category } from "../models/Category.js";

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

const normalizeName = (name: string) => name.trim();

const normalizeSlug = (slug: string) => slug.trim().toLowerCase();

export const createCategory = async (
  input: CreateCategoryInput
) => {
  const name = normalizeName(input.name);
  const slug = normalizeSlug(input.slug);

  const existingCategory = await Category.findOne({
    where: {
      [Op.or]: [{ name }, { slug }],
    },
  });

  if (existingCategory) {
    if (existingCategory.name.toLowerCase() === name.toLowerCase()) {
      throw new Error("A category with this name already exists");
    }

    if (existingCategory.slug === slug) {
      throw new Error("A category with this slug already exists");
    }
  }

  if (input.parentId) {
    const parentCategory = await Category.findByPk(input.parentId);

    if (!parentCategory) {
      throw new Error("Parent category not found");
    }
  }

  const category = await Category.create({
    name,
    slug,
    description: input.description?.trim() || null,
    image: input.image?.trim() || null,
    parentId: input.parentId ?? null,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  });

  return category;
};

export const getCategories = async () => {
  return Category.findAll({
    order: [
      ["sortOrder", "ASC"],
      ["name", "ASC"],
    ],
  });
};

export const getCategoryById = async (id: string) => {
  const category = await Category.findByPk(id);

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

export const getCategoryBySlug = async (slug: string) => {
  const category = await Category.findOne({
    where: {
      slug: normalizeSlug(slug),
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

export const updateCategory = async (
  id: string,
  input: UpdateCategoryInput
) => {
  const category = await Category.findByPk(id);

  if (!category) {
    throw new Error("Category not found");
  }

  const name = input.name !== undefined
    ? normalizeName(input.name)
    : category.name;

  const slug = input.slug !== undefined
    ? normalizeSlug(input.slug)
    : category.slug;

  const duplicateCategory = await Category.findOne({
    where: {
      id: {
        [Op.ne]: id,
      },
      [Op.or]: [{ name }, { slug }],
    },
  });

  if (duplicateCategory) {
    if (
      duplicateCategory.name.toLowerCase() ===
      name.toLowerCase()
    ) {
      throw new Error("A category with this name already exists");
    }

    if (duplicateCategory.slug === slug) {
      throw new Error("A category with this slug already exists");
    }
  }

  if (input.parentId !== undefined) {
    if (input.parentId === id) {
      throw new Error(
        "A category cannot be its own parent"
      );
    }

    if (input.parentId) {
      const parentCategory = await Category.findByPk(
        input.parentId
      );

      if (!parentCategory) {
        throw new Error("Parent category not found");
      }
    }
  }

  await category.update({
    name,
    slug,
    description:
      input.description !== undefined
        ? input.description?.trim() || null
        : category.description,

    image:
      input.image !== undefined
        ? input.image?.trim() || null
        : category.image,

    parentId:
      input.parentId !== undefined
        ? input.parentId
        : category.parentId,

    isActive:
      input.isActive !== undefined
        ? input.isActive
        : category.isActive,

    sortOrder:
      input.sortOrder !== undefined
        ? input.sortOrder
        : category.sortOrder,
  });

  return category;
};

export const deactivateCategory = async (
  categoryId: string
): Promise<Category> => {
  const category = await Category.findByPk(
    categoryId
  );

  if (!category) {
    throw new Error("Category not found");
  }

  await category.update({
    isActive: false,
  });

  return category;
};

export const activateCategory = async (
  categoryId: string
): Promise<Category> => {
  const category = await Category.findByPk(
    categoryId
  );

  if (!category) {
    throw new Error("Category not found");
  }

  await category.update({
    isActive: true,
  });

  return category;
};