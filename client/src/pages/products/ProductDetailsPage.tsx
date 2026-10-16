import { useEffect, useMemo, useState } from "react";

import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../features/auth/useAuth";

import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlistCheck,
} from "../../features/wishlist/useWishlist";

import { useAddToCart } from "../../features/cart/useCart";

import { useVariantAvailability } from "../../features/products/useVariantAvailability";

import { useProduct } from "../../features/products/useProduct";

import ProductImage from "../../features/products/ProductImage";

export default function ProductDetailsPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const navigate = useNavigate();

  const location = useLocation();

  const { data: user } = useAuth();

  const { data: product, isLoading, isError, error } = useProduct(slug);

  const [selectedImage, setSelectedImage] = useState(0);

  const [selectedColor, setSelectedColor] = useState("");

  const [selectedSize, setSelectedSize] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [cartMessage, setCartMessage] = useState("");

  const productImages = useMemo(() => {
    if (!product) {
      return [];
    }

    return [
      ...(product.mainImage ? [product.mainImage] : []),
      ...(product.images ?? []),
    ].filter((image, index, array) => array.indexOf(image) === index);
  }, [product]);

  const activeVariants =
    product?.variants?.filter((variant) => variant.isActive) ?? [];

  const colors = useMemo(() => {
    return Array.from(
      new Map(
        activeVariants.map((variant) => [variant.color, variant.colorCode]),
      ),
    );
  }, [activeVariants]);

  const sizes = useMemo(() => {
    return Array.from(new Set(activeVariants.map((variant) => variant.size)));
  }, [activeVariants]);

  const selectedVariant = useMemo(() => {
    return activeVariants.find(
      (variant) =>
        variant.color === selectedColor && variant.size === selectedSize,
    );
  }, [activeVariants, selectedColor, selectedSize]);

  const { data: availability, isLoading: isAvailabilityLoading } =
    useVariantAvailability(selectedVariant?.id);

  const { data: isInWishlist = false } = useWishlistCheck(product?.id);

  const addToWishlist = useAddToWishlist();

  const removeFromWishlist = useRemoveFromWishlist();

  const addToCart = useAddToCart();

  const isWishlistPending =
    addToWishlist.isPending || removeFromWishlist.isPending;

  const isCartPending = addToCart.isPending;

  useEffect(() => {
    setSelectedImage(0);
    setSelectedColor("");
    setSelectedSize("");
    setQuantity(1);
    setCartMessage("");
  }, [product?.id]);

  useEffect(() => {
    if (!selectedColor && colors.length > 0) {
      setSelectedColor(colors[0][0]);
    }
  }, [colors, selectedColor]);

  useEffect(() => {
    if (!selectedSize && sizes.length > 0) {
      setSelectedSize(sizes[0]);
    }
  }, [sizes, selectedSize]);

  useEffect(() => {
    setQuantity(1);
    setCartMessage("");
  }, [selectedVariant?.id]);

  const handleWishlistToggle = () => {
    if (!user) {
      navigate("/login", {
        state: {
          from: location.pathname + location.search,
        },
      });

      return;
    }

    if (!product || isWishlistPending) {
      return;
    }

    if (isInWishlist) {
      removeFromWishlist.mutate(product.id);

      return;
    }

    addToWishlist.mutate({
      productId: product.id,
    });
  };

  const handleDecreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleIncreaseQuantity = () => {
    if (!availability?.available) {
      return;
    }

    setQuantity((current) =>
      Math.min(availability.availableQuantity, current + 1),
    );
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/login", {
        state: {
          from: location.pathname + location.search,
        },
      });

      return;
    }

    if (!selectedVariant) {
      setCartMessage("Please select a color and size.");

      return;
    }

    if (!availability?.available) {
      setCartMessage("This variant is currently unavailable.");

      return;
    }

    addToCart.mutate(
      {
        variantId: selectedVariant.id,
        quantity,
      },
      {
        onSuccess: () => {
          setCartMessage("Product added to your cart.");
        },

        onError: (mutationError) => {
          setCartMessage(
            mutationError instanceof Error
              ? mutationError.message
              : "Unable to add product to cart.",
          );
        },
      },
    );
  };

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {" "}
        <div className="grid animate-pulse gap-10 lg:grid-cols-2">
          {" "}
          <div className="aspect-[3/4] rounded-xl bg-gray-200" />
          <div className="space-y-5">
            <div className="h-4 w-24 rounded bg-gray-200" />

            <div className="h-10 w-3/4 rounded bg-gray-200" />

            <div className="h-6 w-32 rounded bg-gray-200" />

            <div className="h-24 rounded bg-gray-200" />

            <div className="h-12 rounded bg-gray-200" />

            <div className="h-12 rounded bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        {" "}
        <div className="max-w-md text-center">
          {" "}
          <h1 className="text-2xl font-semibold text-gray-900">
            Product not found{" "}
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error instanceof Error
              ? error.message
              : "We couldn't load this product."}
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const currentPrice =
    selectedVariant?.price ?? product.discountPrice ?? product.basePrice;

  const hasDiscount =
    !selectedVariant &&
    Boolean(product.discountPrice) &&
    Number(product.discountPrice) < Number(product.basePrice);

  const availableQuantity = availability?.availableQuantity ?? 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {" "}
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {" "}
        <div className="space-y-4">
          {" "}
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
            {productImages.length > 0 ? (
              <ProductImage
                src={productImages[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <ProductImage
                src={null}
                alt={product.name}
                className="h-full w-full"
              />
            )}{" "}
          </div>
          {productImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${
                    selectedImage === index
                      ? "border-black"
                      : "border-transparent"
                  }`}
                  aria-label={`View product image ${index + 1}`}
                >
                  <ProductImage
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="lg:py-4">
          {product.brand && (
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              {product.brand}
            </p>
          )}

          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              {product.name}
            </h1>

            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={isWishlistPending}
              aria-label={
                isInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
              aria-pressed={isInWishlist}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isInWishlist
                  ? "border-black text-black"
                  : "border-gray-200 text-gray-700 hover:border-black hover:text-black"
              }`}
            >
              <Heart
                className={`h-5 w-5 transition-transform ${
                  isWishlistPending ? "animate-pulse" : ""
                }`}
                fill={isInWishlist ? "currentColor" : "none"}
              />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-2xl font-semibold text-gray-900">
              Rs. {Number(currentPrice).toLocaleString()}
            </span>

            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">
                Rs. {Number(product.basePrice).toLocaleString()}
              </span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 text-sm leading-7 text-gray-600">
              {product.description}
            </p>
          )}

          <div className="my-8 border-t" />

          {colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900">Color</h2>

                <span className="text-sm text-gray-500">{selectedColor}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                {colors.map(([color, colorCode]) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select ${color}`}
                    aria-pressed={selectedColor === color}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                      selectedColor === color
                        ? "border-black"
                        : "border-gray-200"
                    }`}
                  >
                    <span
                      className="h-7 w-7 rounded-full border border-gray-200"
                      style={{
                        backgroundColor: colorCode,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900">Size</h2>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    aria-pressed={selectedSize === size}
                    className={`min-w-12 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            {isAvailabilityLoading ? (
              <p className="text-sm text-gray-500">Checking availability...</p>
            ) : selectedVariant ? (
              availability?.available ? (
                <p className="text-sm font-medium text-green-600">
                  In stock
                  {availableQuantity <= 5 &&
                    ` — Only ${availableQuantity} left`}
                </p>
              ) : (
                <p className="text-sm font-medium text-red-600">Out of stock</p>
              )
            ) : (
              <p className="text-sm text-gray-500">
                Select a color and size to check availability.
              </p>
            )}
          </div>

          {selectedVariant && availability?.available && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-900">Quantity</h2>

              <div className="mt-3 inline-flex items-center rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1}
                  className="flex h-11 w-11 items-center justify-center text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="flex h-11 min-w-12 items-center justify-center border-x border-gray-200 text-sm font-medium">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={handleIncreaseQuantity}
                  disabled={quantity >= availableQuantity}
                  className="flex h-11 w-11 items-center justify-center text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {cartMessage && (
            <p
              className={`mt-4 text-sm ${
                cartMessage.includes("added")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {cartMessage}
            </p>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              isCartPending || !selectedVariant || !availability?.available
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-6 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <ShoppingBag className="h-5 w-5" />

            {isCartPending ? "Adding..." : "Add to Cart"}
          </button>

          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">
              Cash on Delivery
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Pay when your order is delivered.
            </p>
          </div>

          {product.category && (
            <div className="mt-6 text-sm text-gray-500">
              Category:{" "}
              <Link
                to={`/products?category=${product.category.slug}`}
                className="font-medium text-gray-900 hover:underline"
              >
                {product.category.name}
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
