import { api } from "../../services/api";
import type {
  Cart,
  CartResponse,
} from "../../types/cart";

interface AddToCartPayload {
  variantId: string;
  quantity: number;
}

interface UpdateCartItemPayload {
  quantity: number;
}

export const cartService = {
  async getCart(): Promise<Cart> {
    const response =
      await api.get<CartResponse>("/cart");

    return response.data.data;
  },

  async addItem(
    payload: AddToCartPayload
  ): Promise<Cart> {
    const response =
      await api.post<CartResponse>(
        "/cart/items",
        payload
      );

    return response.data.data;
  },

  async updateItem(
    itemId: string,
    payload: UpdateCartItemPayload
  ): Promise<Cart> {
    const response =
      await api.patch<CartResponse>(
        `/cart/items/${itemId}`,
        payload
      );

    return response.data.data;
  },

  async removeItem(
    itemId: string
  ): Promise<Cart> {
    const response =
      await api.delete<CartResponse>(
        `/cart/items/${itemId}`
      );

    return response.data.data;
  },

  async clearCart(): Promise<Cart> {
    const response =
      await api.delete<CartResponse>(
        "/cart"
      );

    return response.data.data;
  },
};

