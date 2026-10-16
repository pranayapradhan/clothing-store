import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "../auth/useAuth";

import { cartService } from "./cart.service";

export const cartQueryKey = [
  "cart",
];

export function useCart() {
  const {
    data: user,
    isLoading: isAuthLoading,
  } = useAuth();

  return useQuery({
    queryKey: cartQueryKey,
    queryFn: cartService.getCart,
    enabled:
      !isAuthLoading && Boolean(user),
    staleTime: 30 * 1000,
  });
}

export function useAddToCart() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: cartService.addItem,

    onSuccess: (cart) => {
      queryClient.setQueryData(
        cartQueryKey,
        cart
      );
    },
  });
}

export function useUpdateCartItem() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) =>
      cartService.updateItem(
        itemId,
        { quantity }
      ),

    onSuccess: (cart) => {
      queryClient.setQueryData(
        cartQueryKey,
        cart
      );
    },
  });
}

export function useRemoveCartItem() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      cartService.removeItem,

    onSuccess: (cart) => {
      queryClient.setQueryData(
        cartQueryKey,
        cart
      );
    },
  });
}

export function useClearCart() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      cartService.clearCart,

    onSuccess: (cart) => {
      queryClient.setQueryData(
        cartQueryKey,
        cart
      );
    },
  });
}