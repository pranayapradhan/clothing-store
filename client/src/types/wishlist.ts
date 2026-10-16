import type { Product } from "./product";

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface Wishlist {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: WishlistItem[];
}

export interface WishlistResponse {
  success: boolean;
  data: Wishlist;
}

export interface WishlistCheckResponse {
  success: boolean;
  data: {
    isInWishlist: boolean;
  };
}
