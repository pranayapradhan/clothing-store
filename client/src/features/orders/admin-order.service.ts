
import { api } from "../../services/api";

import type {
  AdminOrderFilters,
  AdminOrderResponse,
  AdminOrdersResponse,
  UpdateAdminOrderStatusPayload,
  UpdateAdminOrderStatusResponse,
} from "./admin-order.types";

export const getAdminOrders = async (
  filters: AdminOrderFilters = {},
): Promise<AdminOrdersResponse> => {
  const response = await api.get<AdminOrdersResponse>(
    "/admin/orders",
    {
      params: filters,
    },
  );

  return response.data;
};

export const getAdminOrderById = async (
  orderId: string,
): Promise<AdminOrderResponse> => {
  const response = await api.get<AdminOrderResponse>(
    `/admin/orders/${orderId}`,
  );

  return response.data;
};

export const updateAdminOrderStatus = async (
  orderId: string,
  payload: UpdateAdminOrderStatusPayload,
): Promise<UpdateAdminOrderStatusResponse> => {
  const response = await api.patch<UpdateAdminOrderStatusResponse>(
    `/admin/orders/${orderId}/status`,
    payload,
  );

  return response.data;
};


export const confirmAdminOrderPayment = async (
  orderId: string,
): Promise<UpdateAdminOrderStatusResponse> => {
  const response = await api.patch<UpdateAdminOrderStatusResponse>(
    `/admin/orders/${orderId}/confirm-payment`,
  );

  return response.data;
};
