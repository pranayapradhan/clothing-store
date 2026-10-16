import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  getOrderById,
  getOrders,
  cancelOrder,
} from "./order.service";
import type { CheckoutPayload } from "./order.types";

export const ordersQueryKey = ["orders"];

export const orderQueryKey = (orderId: string) => ["orders", orderId];

export const useOrders = () => {
  return useQuery({
    queryKey: ordersQueryKey,
    queryFn: getOrders,
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: orderQueryKey(orderId),
    queryFn: () => getOrderById(orderId),
    enabled: Boolean(orderId),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckoutPayload) => createOrder(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      queryClient.invalidateQueries({
        queryKey: ordersQueryKey,
      });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      reason,
    }: {
      orderId: string;
      reason: string;
    }) => cancelOrder(orderId, reason),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKey,
      });

      queryClient.invalidateQueries({
        queryKey: orderQueryKey(variables.orderId),
      });
    },
  });
};