export interface Inventory {
  id: string;
  variantId: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  availableQuantity: number;
}