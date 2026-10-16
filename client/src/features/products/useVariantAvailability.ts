import { useQuery } from "@tanstack/react-query";

import { inventoryService } from "./inventory.service";

export function useVariantAvailability(
  variantId: string | undefined
) {
  return useQuery({
    queryKey: ["variant-availability", variantId],
    queryFn: () =>
      inventoryService.getVariantAvailability(variantId!),
    enabled: Boolean(variantId),
  });
}