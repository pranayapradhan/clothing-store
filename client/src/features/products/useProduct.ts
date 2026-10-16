import { useQuery } from "@tanstack/react-query";

import { productDetailsService } from "./product-details.service";

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productDetailsService.getProductBySlug(slug!),
    enabled: Boolean(slug),
  });
}