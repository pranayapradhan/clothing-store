export interface CheckoutRequest {
  customerName: string;
  customerPhone: string;

  shippingAddressLine1: string;
  shippingAddressLine2?: string;

  shippingCity: string;
  shippingState?: string;
  shippingPostalCode?: string;

  notes?: string;
}

export interface CancelOrderRequest {
reason: string;
}