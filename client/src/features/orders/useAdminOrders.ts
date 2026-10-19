
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminOrderById,
  getAdminOrders,
  updateAdminOrderStatus,
  confirmAdminOrderPayment,
} from "./admin-order.service";

import type {
  AdminOrderFilters,
  UpdateAdminOrderStatusPayload,
} from "./admin-order.types";

export const adminOrdersQueryKey = ["admin", "orders"] as const;

export const useAdminOrders = (filters: AdminOrderFilters = {}) => {
  return useQuery({
    queryKey: [...adminOrdersQueryKey, filters],
    queryFn: () => getAdminOrders(filters),
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useAdminOrder = (orderId: string) => {
  return useQuery({
    queryKey: [...adminOrdersQueryKey, "detail", orderId],
    queryFn: () => getAdminOrderById(orderId),
    enabled: Boolean(orderId),
    staleTime: 30 * 1000,
  });
};

export const useUpdateAdminOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: UpdateAdminOrderStatusPayload;
    }) => updateAdminOrderStatus(orderId, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminOrdersQueryKey,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...adminOrdersQueryKey,
          "detail",
          variables.orderId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "inventory"],
      });
    },
  });
};

export const useConfirmAdminOrderPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) =>
      confirmAdminOrderPayment(orderId),

    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({
        queryKey: adminOrdersQueryKey,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...adminOrdersQueryKey,
          "detail",
          orderId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      });
    },
  });
};
