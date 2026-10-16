import { api } from "../../services/api";

import type {
  Inventory,
  InventoryAvailabilityResponse,
  InventoryResponse,
  LowStockResponse,
} from "./inventory.types";

export interface SetInventoryPayload {
  quantity: number;
  lowStockThreshold?: number;
}

export interface AdjustInventoryPayload {
  quantity: number;
}

export interface ReserveInventoryPayload {
  quantity: number;
}

export interface ReleaseInventoryPayload {
  quantity: number;
}

export const getInventory = async (
  variantId: string
): Promise<Inventory | null> => {
  try {
    const response = await api.get<InventoryResponse>(
      `/admin/inventory/${variantId}`
    );

    return response.data.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

export const initializeInventory = async (
  variantId: string,
  payload: SetInventoryPayload
): Promise<Inventory> => {
  const response = await api.post<InventoryResponse>(
    `/admin/inventory/${variantId}/initialize`,
    payload
  );

  return response.data.data;
};

export const setInventory = async (
  variantId: string,
  payload: SetInventoryPayload
): Promise<Inventory> => {
  const response = await api.patch<InventoryResponse>(
    `/admin/inventory/${variantId}`,
    payload
  );

  return response.data.data;
};

export const adjustInventory = async (
  variantId: string,
  payload: AdjustInventoryPayload
): Promise<Inventory> => {
  const response = await api.post<InventoryResponse>(
    `/admin/inventory/${variantId}/adjust`,
    payload
  );

  return response.data.data;
};

export const reserveInventory = async (
  variantId: string,
  payload: ReserveInventoryPayload
): Promise<Inventory> => {
  const response = await api.post<InventoryResponse>(
    `/admin/inventory/${variantId}/reserve`,
    payload
  );

  return response.data.data;
};

export const releaseInventory = async (
  variantId: string,
  payload: ReleaseInventoryPayload
): Promise<Inventory> => {
  const response = await api.post<InventoryResponse>(
    `/admin/inventory/${variantId}/release`,
    payload
  );

  return response.data.data;
};

export const getLowStockInventory = async (): Promise<
  LowStockResponse["data"]
> => {
  const response = await api.get<LowStockResponse>(
    "/admin/inventory/low-stock"
  );

  return response.data.data;
};

export const getInventoryAvailability = async (
  variantId: string
): Promise<InventoryAvailabilityResponse["data"]> => {
  const response =
    await api.get<InventoryAvailabilityResponse>(
      `/inventory/variants/${variantId}/availability`
    );

  return response.data.data;
};