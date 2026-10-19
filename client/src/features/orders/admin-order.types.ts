
import type { Order, OrderStatus } from "./order.types";

export interface AdminOrderFilters {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrdersPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOrdersResponse {
  success: boolean;
  data: Order[];
  pagination: AdminOrdersPagination;
}

export interface AdminOrderResponse {
  success: boolean;
  data: Order;
}

export interface UpdateAdminOrderStatusPayload {
  status: OrderStatus;
  reason?: string;
}

export interface UpdateAdminOrderStatusResponse {
  success: boolean;
  message: string;
  data: Order;
}
