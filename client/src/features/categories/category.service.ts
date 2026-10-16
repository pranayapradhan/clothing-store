import { api } from "../../services/api";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success: boolean;
  data:
    | Category[]
    | {
        categories?: Category[];
      };
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response =
      await api.get<CategoriesResponse>("/categories");

    const data = response.data.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.categories)) {
      return data.categories;
    }

    return [];
  },
};