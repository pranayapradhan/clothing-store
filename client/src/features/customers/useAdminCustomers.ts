
import { useQuery } from "@tanstack/react-query";

import {
  getAdminCustomerById,
  getAdminCustomers,
} from "./admin-customer.service";

import type { AdminCustomerFilters } from "./admin-customer.types";

export const adminCustomersQueryKey = [
  "admin",
  "customers",
] as const;

export const useAdminCustomers = (
  filters: AdminCustomerFilters = {},
) => {
  return useQuery({
    queryKey: [...adminCustomersQueryKey, filters],
    queryFn: () => getAdminCustomers(filters),
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useAdminCustomer = (customerId: string) => {
  return useQuery({
    queryKey: [
      ...adminCustomersQueryKey,
      "detail",
      customerId,
    ],
    queryFn: () => getAdminCustomerById(customerId),
    enabled: Boolean(customerId),
    staleTime: 30 * 1000,
  });
};
