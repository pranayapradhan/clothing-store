import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import PageContainer from "../../components/shared/PageContainer";
import ProductImage from "../../features/products/ProductImage";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "../../features/cart/useCart";

export default function CartPage() {
  const {
    data: cart,
    isLoading,
    isError,
    error,
  } = useCart();

  const updateCartItem =
    useUpdateCartItem();

  const removeCartItem =
    useRemoveCartItem();

  const clearCart =
    useClearCart();

  if (isLoading) {
    return (
      <PageContainer className="py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-40 rounded bg-gray-200" />

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 rounded-xl bg-gray-100"
                />
              ))}
            </div>

            <div className="h-64 rounded-xl bg-gray-100" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer className="py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-xl font-semibold">
            Unable to load your cart
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error instanceof Error
              ? error.message
              : "Something went wrong."}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-6 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </PageContainer>
    );
  }

  const items = cart?.items ?? [];

  const subtotal = items.reduce(
    (total, item) =>
      total +
      Number(item.price) * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <PageContainer className="py-16">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <ShoppingBag className="h-7 w-7 text-gray-500" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold">
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Looks like you haven't added
            anything to your cart yet.
          </p>

          <Link
            to="/products"
            className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      </PageContainer>
    );
  }

  const isUpdating =
    updateCartItem.isPending ||
    removeCartItem.isPending;

  return (
    <PageContainer className="py-8 sm:py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Your Cart
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {items.length}{" "}
            {items.length === 1
              ? "item"
              : "items"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => clearCart.mutate()}
          disabled={clearCart.isPending}
          className="text-sm font-medium text-gray-500 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {clearCart.isPending
            ? "Clearing..."
            : "Clear cart"}
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => {
            const product =
              item.variant.product;

            const availableQuantity =
              item.variant.inventory
                ? item.variant.inventory.quantity -
                  item.variant.inventory
                    .reservedQuantity
                : 0;

            const canIncrease =
              item.quantity <
              availableQuantity;

            return (
              <div
                key={item.id}
                className="rounded-xl border bg-white p-4"
              >
                <div className="flex gap-4">
                  <Link
                    to={`/products/${product.slug}`}
                    className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-36 sm:w-28"
                  >
                    <ProductImage
                      src={product.mainImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {product.brand && (
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            {product.brand}
                          </p>
                        )}

                        <Link
                          to={`/products/${product.slug}`}
                          className="mt-1 block text-sm font-semibold text-gray-900 hover:underline sm:text-base"
                        >
                          {product.name}
                        </Link>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span>
                            Color:{" "}
                            {item.variant.color}
                          </span>

                          <span>
                            Size:{" "}
                            {item.variant.size}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeCartItem.mutate(
                            item.id
                          )
                        }
                        disabled={
                          isUpdating
                        }
                        className="rounded-md p-2 text-gray-400 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          Rs.{" "}
                          {Number(
                            item.price
                          ).toLocaleString()}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {availableQuantity}{" "}
                          available
                        </p>
                      </div>

                      <div className="flex items-center rounded-lg border">
                        <button
                          type="button"
                          onClick={() =>
                            updateCartItem.mutate(
                              {
                                itemId:
                                  item.id,
                                quantity:
                                  item.quantity -
                                  1,
                              }
                            )
                          }
                          disabled={
                            item.quantity <=
                              1 ||
                            isUpdating
                          }
                          className="p-2.5 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="min-w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateCartItem.mutate(
                              {
                                itemId:
                                  item.id,
                                quantity:
                                  item.quantity +
                                  1,
                              }
                            )
                          }
                          disabled={
                            !canIncrease ||
                            isUpdating
                          }
                          className="p-2.5 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <aside className="h-fit rounded-xl border bg-gray-50 p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">
            Order Summary
          </h2>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span className="font-medium">
                Rs.{" "}
                {subtotal.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Delivery
              </span>

              <span className="font-medium">
                Calculated at checkout
              </span>
            </div>
          </div>

          <div className="my-5 border-t" />

          <div className="flex justify-between gap-4">
            <span className="font-semibold">
              Total
            </span>

            <span className="text-lg font-semibold">
              Rs.{" "}
              {subtotal.toLocaleString()}
            </span>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block w-full rounded-lg bg-black px-5 py-3.5 text-center text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Proceed to Checkout
          </Link>

          <p className="mt-4 text-center text-xs text-gray-500">
            Cash on Delivery available
          </p>
        </aside>
      </div>
    </PageContainer>
  );
}