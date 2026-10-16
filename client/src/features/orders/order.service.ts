import { api } from "../../services/api";
import type {
  CheckoutPayload,
  CreateOrderResponse,
  OrdersResponse,
  OrderResponse,
} from "./order.types";

export const createOrder = async (
  payload: CheckoutPayload
): Promise<CreateOrderResponse> => {
  const response = await api.post<CreateOrderResponse>(
    "/orders",
    payload
  );

  return response.data;
};

export const getOrders = async (): Promise<OrdersResponse> => {
const response = await api.get<OrdersResponse>("/orders");

return response.data;
};

export const getOrderById = async (
orderId: string,
): Promise<OrderResponse> => {
const response = await api.get<OrderResponse>(
`/orders/${orderId}`,
);

return response.data;
};

export const cancelOrder = async (
orderId: string,
reason: string,
): Promise<OrderResponse> => {
const response = await api.patch<OrderResponse>(
`/orders/${orderId}/cancel`,
{ reason },
);

return response.data;
};