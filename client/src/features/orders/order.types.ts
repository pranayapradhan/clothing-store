export interface CheckoutPayload {
  customerName: string;
  customerPhone: string;

  shippingAddressLine1: string;
  shippingAddressLine2?: string;

  shippingCity: string;
  shippingState?: string;
  shippingPostalCode?: string;

  notes?: string;
}

export interface OrderItem {
  id: string;
  variantId: string | null;

  productName: string;
  productSlug: string;
  productImage: string | null;

  color: string;
  size: string;
  sku: string;

  unitPrice: string;
  quantity: number;
  lineTotal: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD";

export type PaymentStatus = "PENDING" | "PAID";

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;

  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  customerName: string;
  customerEmail: string;
  customerPhone: string;

  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string;

  notes: string | null;

  subtotal: string;
  deliveryCharge: string;
  discount: string;
  total: string;

  cancelledAt: string | null;
  cancellationReason: string | null;
  cancelledBy: "USER" | "ADMIN" | null;
  
  items: OrderItem[];
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface OrdersResponse {
success: boolean;
data: Order[];
}

export interface OrderResponse {
success: boolean;
data: Order;
}
