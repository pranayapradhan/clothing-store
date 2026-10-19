
import { api } from "../../services/api";

import type {
  AdminCustomerFilters,
  AdminCustomersResponse,
  AdminCustomerResponse,
} from "./admin-customer.types";

export const getAdminCustomers = async (
  filters: AdminCustomerFilters = {},
): Promise<AdminCustomersResponse> => {
  const response = await api.get<AdminCustomersResponse>(
    "/admin/customers",
    {
      params: filters,
    },
  );

  return response.data;
};

export const getAdminCustomerById = async (
  customerId: string,
): Promise<AdminCustomerResponse> => {
  const response = await api.get<AdminCustomerResponse>(
    `/admin/customers/${customerId}`,
  );

  return response.data;
};
