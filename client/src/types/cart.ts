import type { Product } from "./product";

export interface CartVariant {
  id: string;
  productId: string;
  color: string;
  colorCode: string;
  size: string;
  sku: string;
  price: string;
  isActive: boolean;
}

export interface CartInventory {
  id: string;
  variantId: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
}

export interface CartProduct
  extends Product {}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  price: string;
  createdAt: string;
  updatedAt: string;

  variant: CartVariant & {
    product: CartProduct;
    inventory: CartInventory;
  };
}

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface CartResponse {
  success: boolean;
  data: Cart;
}