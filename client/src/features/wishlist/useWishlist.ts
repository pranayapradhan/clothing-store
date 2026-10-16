import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "../auth/useAuth";

import { wishlistService } from "./wishlist.service";

export const wishlistQueryKey = [
  "wishlist",
];

export function wishlistCheckQueryKey(
  productId: string
) {
  return [
    "wishlist-check",
    productId,
  ];
}

export function useWishlist() {
  const {
    data: user,
    isLoading: isAuthLoading,
  } = useAuth();

  return useQuery({
    queryKey: wishlistQueryKey,
    queryFn: wishlistService.getWishlist,
    enabled:
      !isAuthLoading && Boolean(user),
    staleTime: 30 * 1000,
  });
}

export function useAddToWishlist() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      wishlistService.addItem,

    onSuccess: (wishlist) => {
      queryClient.setQueryData(
        wishlistQueryKey,
        wishlist
      );

      for (const item of wishlist.items) {
        queryClient.setQueryData(
          wishlistCheckQueryKey(
            item.productId
          ),
          true
        );
      }
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      wishlistService.removeItem,

    onSuccess: (wishlist) => {
      queryClient.setQueryData(
        wishlistQueryKey,
        wishlist
      );

      queryClient.invalidateQueries({
        queryKey: [
          "wishlist-check",
        ],
        exact: false,
      });
    },
  });
}

export function useClearWishlist() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      wishlistService.clearWishlist,

    onSuccess: (wishlist) => {
      queryClient.setQueryData(
        wishlistQueryKey,
        wishlist
      );

      queryClient.invalidateQueries({
        queryKey: [
          "wishlist-check",
        ],
        exact: false,
      });
    },
  });
}

export function useWishlistCheck(
  productId: string | undefined
) {
  const {
    data: user,
    isLoading: isAuthLoading,
  } = useAuth();

  return useQuery({
    queryKey: productId
      ? wishlistCheckQueryKey(
          productId
        )
      : [
          "wishlist-check",
          undefined,
        ],

    queryFn: () =>
      wishlistService.checkProduct(
        productId!
      ),

    enabled:
      !isAuthLoading &&
      Boolean(user) &&
      Boolean(productId),

    staleTime: 30 * 1000,
  });
}