
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "../orders/order.types";

export interface AdminCustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  role: "USER";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
}

export interface AdminCustomerOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: string;
  createdAt: string;
}

export interface AdminCustomerDetails extends AdminCustomer {
  totalSpent: number;
  orders: AdminCustomerOrder[];
}

export interface AdminCustomerPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminCustomersResponse {
  success: boolean;
  data: AdminCustomer[];
  pagination: AdminCustomerPagination;
}

export interface AdminCustomerResponse {
  success: boolean;
  data: AdminCustomerDetails;
}
