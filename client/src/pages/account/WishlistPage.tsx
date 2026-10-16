import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Heart,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import ProductImage from "../../features/products/ProductImage";
import {
  useClearWishlist,
  useRemoveFromWishlist,
  useWishlist,
} from "../../features/wishlist/useWishlist";

export default function WishlistPage() {
  const navigate = useNavigate();

  const {
    data: wishlist,
    isLoading,
    isError,
    error,
  } = useWishlist();

  const removeFromWishlist =
    useRemoveFromWishlist();

  const clearWishlist =
    useClearWishlist();

  const items = wishlist?.items ?? [];

  const handleRemove = (productId: string) => {
    removeFromWishlist.mutate(productId);
  };

  const handleClear = () => {
    if (items.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear your wishlist?"
    );

    if (!confirmed) return;

    clearWishlist.mutate();
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 w-40 rounded bg-gray-200" />

          <div className="mt-3 h-4 w-64 rounded bg-gray-200" />

          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div key={index}>
                  <div className="aspect-[3/4] rounded-lg bg-gray-200" />

                  <div className="mt-3 h-3 w-20 rounded bg-gray-200" />

                  <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />

                  <div className="mt-2 h-4 w-24 rounded bg-gray-200" />
                </div>
              )
            )}
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Heart className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold text-gray-900">
            Unable to load wishlist
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error instanceof Error
              ? error.message
              : "Something went wrong while loading your wishlist."}
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[65vh] w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="max-w-md text-center"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Heart className="h-9 w-9 text-gray-400" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-gray-900">
            Your wishlist is empty
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Save your favorite clothing items
            here and come back when you're ready.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6" />

            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Wishlist
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            {items.length} saved{" "}
            {items.length === 1
              ? "item"
              : "items"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClear}
          disabled={clearWishlist.isPending}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />

          {clearWishlist.isPending
            ? "Clearing..."
            : "Clear Wishlist"}
        </button>
      </div>

      {/* Wishlist Items */}
      <motion.div
        layout
        className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => {
            const product = item.product;

            const currentPrice =
              product.discountPrice ??
              product.basePrice;

            const hasDiscount =
              Boolean(
                product.discountPrice
              ) &&
              Number(
                product.discountPrice
              ) <
                Number(
                  product.basePrice
                );

            return (
              <motion.article
                key={item.id}
                layout
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="group"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                  <Link
                    to={`/products/${product.slug}`}
                    className="block h-full w-full"
                  >
                    <ProductImage
                      src={product.mainImage}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {hasDiscount && (
                    <span className="absolute left-3 top-3 rounded-full bg-black px-2.5 py-1 text-xs font-medium text-white">
                      Sale
                    </span>
                  )}

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() =>
                      handleRemove(
                        product.id
                      )
                    }
                    disabled={
                      removeFromWishlist.isPending
                    }
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-600 shadow-sm transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    <Heart
                      className="h-4 w-4"
                      fill="currentColor"
                    />
                  </button>
                </div>

                {/* Product Information */}
                <div className="mt-4">
                  {product.brand && (
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {product.brand}
                    </p>
                  )}

                  <Link
                    to={`/products/${product.slug}`}
                    className="mt-1 block"
                  >
                    <h2 className="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-gray-600">
                      {product.name}
                    </h2>
                  </Link>

                  {/* Price */}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Rs.{" "}
                      {Number(
                        currentPrice
                      ).toLocaleString()}
                    </span>

                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">
                        Rs.{" "}
                        {Number(
                          product.basePrice
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/products/${product.slug}`
                      )
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-900 transition hover:border-black hover:bg-black hover:text-white"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Choose Options
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Bottom CTA */}
      <div className="mt-12 border-t pt-8 text-center">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 underline-offset-4 hover:underline"
        >
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
