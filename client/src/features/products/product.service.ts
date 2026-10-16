import { api } from "../../services/api";
import type { Product } from "../../types/product";

export interface ProductFilters {
  category?: string;
  search?: string;
  brand?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: ProductPagination;
}

export interface ProductsResult {
  products: Product[];
  pagination: ProductPagination;
}

export const productService = {
  async getProducts(
    filters: ProductFilters = {}
  ): Promise<ProductsResult> {
    const response =
      await api.get<ProductsResponse>(
        "/products",
        {
          params: {
            ...(filters.category && {
              category: filters.category,
            }),

            ...(filters.search && {
              search: filters.search,
            }),

            ...(filters.brand && {
              brand: filters.brand,
            }),

            ...(filters.size && {
              size: filters.size,
            }),

            ...(filters.color && {
              color: filters.color,
            }),

            ...(filters.minPrice !==
              undefined && {
              minPrice:
                filters.minPrice,
            }),

            ...(filters.maxPrice !==
              undefined && {
              maxPrice:
                filters.maxPrice,
            }),

            ...(filters.page !==
              undefined && {
              page: filters.page,
            }),

            ...(filters.limit !==
              undefined && {
              limit: filters.limit,
            }),
          },
        }
      );

    return {
      products: response.data.data,
      pagination:
        response.data.pagination,
    };
  },
};