import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { authService } from "./auth.service";

import type {
  LoginPayload,
  RegisterPayload,
} from "./auth.types";

export const authQueryKey = [
  "auth",
  "me",
];

export function useAuth() {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: authService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: LoginPayload
    ) => authService.login(payload),

    onSuccess: (user) => {
      queryClient.setQueryData(
        authQueryKey,
        user
      );
    },
  });
}

export function useRegister() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: RegisterPayload
    ) =>
      authService.register(payload),

    onSuccess: (user) => {
      queryClient.setQueryData(
        authQueryKey,
        user
      );
    },
  });
}

export function useLogout() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: authService.logout,

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: authQueryKey,
      });

      queryClient.removeQueries({
        queryKey: ["wishlist"],
      });

      queryClient.removeQueries({
        queryKey: ["wishlist-check"],
      });

      queryClient.removeQueries({
        queryKey: ["cart"],
      });
    },
  });
}