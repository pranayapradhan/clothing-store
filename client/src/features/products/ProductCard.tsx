import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlistCheck,
} from "../wishlist/useWishlist";

import type { Product } from "../../types/product";

import ProductImage from "./ProductImage";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const { data: user } = useAuth();

  const { data: isInWishlist = false } = useWishlistCheck(product.id);

  const addToWishlist = useAddToWishlist();

  const removeFromWishlist = useRemoveFromWishlist();

  const isWishlistPending =
    addToWishlist.isPending || removeFromWishlist.isPending;

  const currentPrice = product.discountPrice ?? product.basePrice;

  const hasDiscount =
    Boolean(product.discountPrice) &&
    Number(product.discountPrice) < Number(product.basePrice);

  const handleWishlistToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

  
if (!user) {
  navigate("/login", {
    state: {
      from:
        window.location.pathname +
        window.location.search,
    },
  });

  return;
}

if (isWishlistPending) {
  return;
}

if (isInWishlist) {
  removeFromWishlist.mutate(
    product.id
  );

  return;
}

addToWishlist.mutate({
  productId: product.id,
});
  };

  return (
    <article className="group">
      {" "}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
        <Link to={`/products/${product.slug}`} className="block h-full w-full">
          {" "}
          <ProductImage
            src={product.mainImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />{" "}
        </Link>
        ```
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-full bg-black px-2.5 py-1 text-xs font-medium text-white">
            Sale
          </span>
        )}
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={isWishlistPending}
          aria-label={
            isInWishlist
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          aria-pressed={isInWishlist}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isInWishlist
              ? "text-black"
              : "text-gray-700 hover:bg-white hover:text-black"
          }`}
        >
          <Heart
            className={`h-4 w-4 transition-transform ${
              isWishlistPending ? "animate-pulse" : ""
            }`}
            fill={isInWishlist ? "currentColor" : "none"}
          />
        </button>
      </div>
      <Link to={`/products/${product.slug}`} className="block">
        <div className="mt-3">
          {product.brand && (
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {product.brand}
            </p>
          )}

          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-gray-600">
            {product.name}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              Rs. {Number(currentPrice).toLocaleString()}
            </span>

            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                Rs. {Number(product.basePrice).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
