import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  adjustInventory,
  getInventory,
  getInventoryAvailability,
  getLowStockInventory,
  initializeInventory,
  releaseInventory,
  reserveInventory,
  setInventory,
} from "./inventory.service";

const inventoryKeys = {
  all: ["inventory"] as const,

  detail: (variantId: string) =>
    ["inventory", "detail", variantId] as const,

  availability: (variantId: string) =>
    ["inventory", "availability", variantId] as const,

  lowStock: ["inventory", "low-stock"] as const,
};

export const useInventory = (
  variantId: string | undefined
) => {
  return useQuery({
    queryKey: variantId
      ? inventoryKeys.detail(variantId)
      : ["inventory", "detail", "disabled"],
    queryFn: () => getInventory(variantId!),
    enabled: Boolean(variantId),
    staleTime: 30 * 1000,
  });
};

export const useLowStockInventory = () => {
  return useQuery({
    queryKey: inventoryKeys.lowStock,
    queryFn: getLowStockInventory,
    staleTime: 30 * 1000,
  });
};

export const useInventoryAvailability = (
  variantId: string | undefined
) => {
  return useQuery({
    queryKey: variantId
      ? inventoryKeys.availability(variantId)
      : ["inventory", "availability", "disabled"],
    queryFn: () =>
      getInventoryAvailability(variantId!),
    enabled: Boolean(variantId),
    staleTime: 30 * 1000,
  });
};

const invalidateInventory = (
  queryClient: ReturnType<typeof useQueryClient>,
  variantId: string
) => {
  queryClient.invalidateQueries({
    queryKey: inventoryKeys.detail(variantId),
  });

  queryClient.invalidateQueries({
    queryKey: inventoryKeys.availability(variantId),
  });

  queryClient.invalidateQueries({
    queryKey: inventoryKeys.lowStock,
  });
};

export const useInitializeInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      variantId,
      payload,
    }: {
      variantId: string;
      payload: Parameters<typeof initializeInventory>[1];
    }) =>
      initializeInventory(variantId, payload),

    onSuccess: (_, variables) => {
      invalidateInventory(
        queryClient,
        variables.variantId
      );
    },
  });
};

export const useSetInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      variantId,
      payload,
    }: {
      variantId: string;
      payload: Parameters<typeof setInventory>[1];
    }) =>
      setInventory(variantId, payload),

    onSuccess: (_, variables) => {
      invalidateInventory(
        queryClient,
        variables.variantId
      );
    },
  });
};

export const useAdjustInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      variantId,
      payload,
    }: {
      variantId: string;
      payload: Parameters<typeof adjustInventory>[1];
    }) =>
      adjustInventory(variantId, payload),

    onSuccess: (_, variables) => {
      invalidateInventory(
        queryClient,
        variables.variantId
      );
    },
  });
};

export const useReserveInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      variantId,
      payload,
    }: {
      variantId: string;
      payload: Parameters<typeof reserveInventory>[1];
    }) =>
      reserveInventory(variantId, payload),

    onSuccess: (_, variables) => {
      invalidateInventory(
        queryClient,
        variables.variantId
      );
    },
  });
};

export const useReleaseInventory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      variantId,
      payload,
    }: {
      variantId: string;
      payload: Parameters<typeof releaseInventory>[1];
    }) =>
      releaseInventory(variantId, payload),

    onSuccess: (_, variables) => {
      invalidateInventory(
        queryClient,
        variables.variantId
      );
    },
  });
};