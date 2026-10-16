import { useQuery } from "@tanstack/react-query";

import {
  productService,
  type ProductFilters,
} from "./product.service";

export function useProducts(
  filters: ProductFilters = {}
) {
  return useQuery({
    queryKey: ["products", filters],

    queryFn: () =>
      productService.getProducts(
        filters
      ),

    placeholderData: (previousData) =>
      previousData,
  });
}