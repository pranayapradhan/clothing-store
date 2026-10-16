import { api } from "../../services/api";

interface VariantAvailability {
  available: boolean;
  availableQuantity: number;
}

interface AvailabilityResponse {
  success: boolean;
  data: VariantAvailability;
}

export const inventoryService = {
  async getVariantAvailability(
    variantId: string
  ): Promise<VariantAvailability> {
    const response =
      await api.get<AvailabilityResponse>(
        `/inventory/variants/${variantId}/availability`
      );

    return response.data.data;
  },
};