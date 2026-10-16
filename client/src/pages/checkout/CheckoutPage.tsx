import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2, MapPin } from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";
import { useCart } from "../../features/cart/useCart";
import { useCreateOrder } from "../../features/orders/useOrders";
import type { CheckoutPayload } from "../../features/orders/order.types";
import ProductImage from "../../features/products/ProductImage";

const DELIVERY_CHARGE = 150;

const CheckoutPage = () => {
  const navigate = useNavigate();

  const { data: user, isLoading: authLoading } = useAuth();
  const {
    data: cart,
    isLoading: cartLoading,
    isError: cartError,
  } = useCart();

  const createOrderMutation = useCreateOrder();

  const [formData, setFormData] = useState<CheckoutPayload>({
    customerName: "",
    customerPhone: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    notes: "",
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", {
        replace: true,
        state: {
          from: "/checkout",
        },
      });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      setFormData((previous) => ({
        ...previous,
        customerName:
          previous.customerName || user.name,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (
      !authLoading &&
      !cartLoading &&
      cart &&
      cart.items.length === 0
    ) {
      navigate("/cart", {
        replace: true,
      });
    }
  }, [
    authLoading,
    cartLoading,
    cart,
    navigate,
  ]);

  const subtotal = useMemo(() => {
    if (!cart) {
      return 0;
    }

    return cart.items.reduce(
      (total, item) =>
        total + Number(item.price) * item.quantity,
      0
    );
  }, [cart]);

  const total = subtotal + DELIVERY_CHARGE;

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }

    if (createOrderMutation.isError) {
      createOrderMutation.reset();
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!cart || cart.items.length === 0) {
      setFormError("Your cart is empty.");
      return;
    }

    setFormError("");

    try {
      const payload: CheckoutPayload = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        shippingAddressLine1:
          formData.shippingAddressLine1.trim(),
        shippingAddressLine2:
          formData.shippingAddressLine2?.trim() || undefined,
        shippingCity: formData.shippingCity.trim(),
        shippingState:
          formData.shippingState?.trim() || undefined,
        shippingPostalCode:
          formData.shippingPostalCode?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      };

      const response =
        await createOrderMutation.mutateAsync(payload);

      navigate(
        `/account/orders/${response.data.id}`,
        {
          replace: true,
          state: {
            orderPlaced: true,
            order: response.data,
          },
        }
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to place your order.";

      setFormError(message);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <main className="min-h-[70vh]">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
          <Loader2
            className="h-8 w-8 animate-spin text-gray-500"
            aria-label="Loading checkout"
          />
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (cartError) {
    return (
      <main className="min-h-[70vh]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">
              Unable to load your cart. Please try again.
            </p>

            <Link
              to="/cart"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <main className="min-h-[70vh] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8">
          <Link
            to="/cart"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Checkout
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Complete your details to place your COD order.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  We'll use these details for delivery.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="customerName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    autoComplete="name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="customerPhone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>

                  <input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    required
                    maxLength={30}
                    autoComplete="tel"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="98XXXXXXXX"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <MapPin className="h-5 w-5 text-gray-700" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Shipping Address
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="shippingAddressLine1"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>

                  <input
                    id="shippingAddressLine1"
                    name="shippingAddressLine1"
                    type="text"
                    value={formData.shippingAddressLine1}
                    onChange={handleChange}
                    required
                    maxLength={255}
                    autoComplete="street-address"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Street, area, house number"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="shippingAddressLine2"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Address Line 2
                    <span className="ml-1 text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="shippingAddressLine2"
                    name="shippingAddressLine2"
                    type="text"
                    value={formData.shippingAddressLine2}
                    onChange={handleChange}
                    maxLength={255}
                    autoComplete="address-line2"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Apartment, landmark, etc."
                  />
                </div>

                <div>
                  <label
                    htmlFor="shippingCity"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    City
                  </label>

                  <input
                    id="shippingCity"
                    name="shippingCity"
                    type="text"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    autoComplete="address-level2"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Kathmandu"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shippingState"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    State / Province
                    <span className="ml-1 text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="shippingState"
                    name="shippingState"
                    type="text"
                    value={formData.shippingState}
                    onChange={handleChange}
                    maxLength={100}
                    autoComplete="address-level1"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Bagmati"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shippingPostalCode"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Postal Code
                    <span className="ml-1 text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="shippingPostalCode"
                    name="shippingPostalCode"
                    type="text"
                    value={formData.shippingPostalCode}
                    onChange={handleChange}
                    maxLength={20}
                    autoComplete="postal-code"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="44600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Delivery Notes
                    <span className="ml-1 text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    maxLength={1000}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="Any special instructions for delivery?"
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto pr-1">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <ProductImage
                        src={
                          item.variant.product?.mainImage ||
                          item.variant.product?.images?.[0]
                        }
                        alt={item.variant.product?.name}
                        className="h-full w-full"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.variant.product?.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.variant.color} /{" "}
                        {item.variant.size}
                      </p>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </span>

                        <span className="text-sm font-medium text-gray-900">
                          Rs.{" "}
                          {(
                            Number(item.price) *
                            item.quantity
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-5 border-t border-gray-200" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal
                  </span>

                  <span className="font-medium text-gray-900">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Delivery
                  </span>

                  <span className="font-medium text-gray-900">
                    Rs. {DELIVERY_CHARGE.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="my-5 border-t border-gray-200" />

              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>

                <span className="text-xl font-bold text-gray-900">
                  Rs. {total.toLocaleString()}
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-black p-1">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Pay in cash when your order is
                      delivered.
                    </p>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {createOrderMutation.isError &&
                !formError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Unable to place your order. Please try
                    again.
                  </div>
                )}

              <button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                By placing your order, you agree to our
                terms and confirm that your information is
                correct.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default CheckoutPage;