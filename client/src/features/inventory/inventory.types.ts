export interface InventoryVariant {
  id: string;
  productId: string;
  color: string;
  colorCode: string;
  size: string;
  sku: string;
  price: string;
  isActive: boolean;
}

export interface Inventory {
  id: string;
  variantId: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
  variant?: InventoryVariant;
}

export interface InventoryResponse {
  success: boolean;
  data: Inventory;
}

export interface InventoryAvailabilityResponse {
  success: boolean;
  data: {
    available: boolean;
    availableQuantity: number;
  };
}

export interface LowStockInventory extends Inventory {
  variant: InventoryVariant & {
    product?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface LowStockResponse {
  success: boolean;
  data: LowStockInventory[];
}