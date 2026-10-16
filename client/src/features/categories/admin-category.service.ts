import { api } from "../../services/api";
import type { Category } from "./category.service";

export interface AdminCategoryResponse {
  success: boolean;
  data:
    | Category
    | {
        category?: Category;
      };
}

export interface AdminCategoriesResponse {
  success: boolean;
  data:
    | Category[]
    | {
        categories?: Category[];
      };
}

export const adminCategoryService = {
  async getCategories(): Promise<Category[]> {
    const response =
      await api.get<AdminCategoriesResponse>(
        "/categories"
      );

    const data = response.data.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.categories)) {
      return data.categories;
    }

    return [];
  },

  async getCategoryById(
    categoryId: string
  ): Promise<Category> {
    const response =
      await api.get<AdminCategoryResponse>(
        `/categories/${categoryId}`
      );

    const data = response.data.data;

    if (
      !Array.isArray(data) &&
      "category" in data &&
      data.category
    ) {
      return data.category;
    }

    return data as Category;
  },

  async createCategory(
    payload: {
      name: string;
      slug?: string;
      description?: string;
      image?: string;
      parentId?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    }
  ): Promise<Category> {
    const response =
      await api.post<AdminCategoryResponse>(
        "/admin/categories",
        payload
      );

    const data = response.data.data;

    if (
      !Array.isArray(data) &&
      "category" in data &&
      data.category
    ) {
      return data.category;
    }

    return data as Category;
  },

  async updateCategory(
    categoryId: string,
    payload: {
      name?: string;
      slug?: string;
      description?: string;
      image?: string;
      parentId?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    }
  ): Promise<Category> {
    const response =
      await api.patch<AdminCategoryResponse>(
        `/admin/categories/${categoryId}`,
        payload
      );

    const data = response.data.data;

    if (
      !Array.isArray(data) &&
      "category" in data &&
      data.category
    ) {
      return data.category;
    }

    return data as Category;
  },

  async deactivateCategory(
  categoryId: string
): Promise<Category> {
  const response =
    await api.patch<AdminCategoryResponse>(
      `/admin/categories/${categoryId}/deactivate`
    );

  const data = response.data.data;

  if (
    !Array.isArray(data) &&
    "category" in data &&
    data.category
  ) {
    return data.category;
  }

  return data as Category;
},

async activateCategory(
  categoryId: string
): Promise<Category> {
  const response =
    await api.patch<AdminCategoryResponse>(
      `/admin/categories/${categoryId}/activate`
    );

  const data = response.data.data;

  if (
    !Array.isArray(data) &&
    "category" in data &&
    data.category
  ) {
    return data.category;
  }

  return data as Category;
},
};