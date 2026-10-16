import { api } from "../../services/api";

import type {
  Wishlist,
  WishlistCheckResponse,
  WishlistResponse,
} from "../../types/wishlist";

interface AddToWishlistPayload {
  productId: string;
}

export const wishlistService = {
  async getWishlist(): Promise<Wishlist> {
    const response =
      await api.get<WishlistResponse>(
        "/wishlist"
      );

    return response.data.data;
  },

  async addItem(
    payload: AddToWishlistPayload
  ): Promise<Wishlist> {
    const response =
      await api.post<WishlistResponse>(
        "/wishlist/items",
        payload
      );

    return response.data.data;
  },

  async removeItem(
    productId: string
  ): Promise<Wishlist> {
    const response =
      await api.delete<WishlistResponse>(
        `/wishlist/items/${productId}`
      );

    return response.data.data;
  },

  async clearWishlist(): Promise<Wishlist> {
    const response =
      await api.delete<WishlistResponse>(
        "/wishlist"
      );

    return response.data.data;
  },

  async checkProduct(
    productId: string
  ): Promise<boolean> {
    const response =
      await api.get<WishlistCheckResponse>(
        `/wishlist/check/${productId}`
      );

    return response.data.data.isInWishlist;
  },
};
