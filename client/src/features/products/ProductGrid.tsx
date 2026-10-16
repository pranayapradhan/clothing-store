import type { Product } from "../../types/product";

import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

interface ProductGridProps {
  products?: Product[];
  isLoading?: boolean;
}

export default function ProductGrid({
  products = [],
  isLoading = false,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}