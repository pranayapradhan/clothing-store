import { api } from "../../services/api";
import type { Product } from "../../types/product";

interface ProductResponse {
  success: boolean;
  data: Product;
}

export const productDetailsService = {
  async getProductBySlug(slug: string): Promise<Product> {
    const response = await api.get<ProductResponse>(
      `/products/slug/${slug}`
    );

    return response.data.data;
  },
};