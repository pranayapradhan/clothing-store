import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
AlertTriangle,
ArrowLeft,
Check,
Clock,
Package,
Truck,
X,
} from "lucide-react";
import ProductImage from "../../features/products/ProductImage";
import {
useCancelOrder,
useOrder,
} from "../../features/orders/useOrders";

const statusSteps = [
{
status: "CONFIRMED",
label: "Order Confirmed",
description: "Your order has been confirmed.",
icon: Check,
},
{
status: "PROCESSING",
label: "Processing",
description: "Your order is being prepared.",
icon: Package,
},
{
status: "SHIPPED",
label: "Shipped",
description: "Your order is on its way.",
icon: Truck,
},
{
status: "DELIVERED",
label: "Delivered",
description: "Your order has been delivered.",
icon: Check,
},
];

const cancellableStatuses = [
"PENDING",
"CONFIRMED",
"PROCESSING",
];

const OrderConfirmationPage = () => {
const { id } = useParams<{ id: string }>();
const navigate = useNavigate();

const {
data,
isLoading,
isError,
refetch,
} = useOrder(id ?? "");

const cancelOrderMutation = useCancelOrder();

const [showCancelDialog, setShowCancelDialog] = useState(false);
const [cancelReason, setCancelReason] = useState("");
const [cancelError, setCancelError] = useState("");

const order = data?.data;

const canCancel =
!!order && cancellableStatuses.includes(order.status);

const handleOpenCancelDialog = () => {
setCancelReason("");
setCancelError("");
setShowCancelDialog(true);
};

const handleCloseCancelDialog = () => {
if (cancelOrderMutation.isPending) {
return;
}

setShowCancelDialog(false);
setCancelReason("");
setCancelError("");

};

const handleCancelOrder = async () => {
const reason = cancelReason.trim();

if (reason.length < 3) {
  setCancelError(
    "Please provide a cancellation reason.",
  );
  return;
}

if (!id) {
  setCancelError("Order ID is missing.");
  return;
}

try {
  setCancelError("");

  await cancelOrderMutation.mutateAsync({
    orderId: id,
    reason,
  });

  setShowCancelDialog(false);
  setCancelReason("");

  await refetch();
} catch (error) {
  const message =
    error instanceof Error
      ? error.message
      : "Failed to cancel the order.";

  setCancelError(message);
}

};

const getStepState = (stepStatus: string) => {
if (!order) {
return "upcoming";
}

if (order.status === "CANCELLED") {
  return "cancelled";
}

const statusOrder = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

const currentIndex = statusOrder.indexOf(order.status);
const stepIndex = statusOrder.indexOf(stepStatus);

if (currentIndex === -1) {
  return "upcoming";
}

if (stepIndex < currentIndex) {
  return "completed";
}

if (stepIndex === currentIndex) {
  return "current";
}

return "upcoming";

};

if (isLoading) {
return (
<div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
<div className="animate-pulse space-y-6">
<div className="h-5 w-32 rounded bg-gray-200" />

      <div className="h-32 rounded-2xl bg-gray-200" />

      <div className="h-64 rounded-2xl bg-gray-200" />

      <div className="h-48 rounded-2xl bg-gray-200" />
    </div>
  </div>
);

}

if (isError || !order) {
return (
<div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center px-4 py-10">
<div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
<AlertTriangle className="h-7 w-7 text-red-500" />
</div>

      <h1 className="text-xl font-semibold text-gray-900">
        Unable to load order
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        We couldn't find this order or something went wrong.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Try Again
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/account/orders")
          }
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          My Orders
        </button>
      </div>
    </div>
  </div>
);

}

return (
<>
<div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
{/* Back */}
<button
type="button"
onClick={() => navigate("/account/orders")}
className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
>
<ArrowLeft className="h-4 w-4" />
Back to Orders
</button>

    {/* Order Header */}
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Order Number
          </p>

          <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
            {order.orderNumber}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Placed on{" "}
            {new Date(
              order.createdAt,
            ).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              order.status === "CANCELLED"
                ? "bg-red-100 text-red-700"
                : order.status === "DELIVERED"
                  ? "bg-green-100 text-green-700"
                  : order.status === "SHIPPED"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
            }`}
          >
            {order.status}
          </span>

          {canCancel && (
            <button
              type="button"
              onClick={handleOpenCancelDialog}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <X className="h-4 w-4" />
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Cancelled Notice */}
    {order.status === "CANCELLED" && (
      <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <X className="h-5 w-5 text-red-600" />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-red-700">
              Order Cancelled
            </h2>

            {order.cancelledAt && (
              <p className="mt-1 text-sm text-red-600">
                Cancelled on{" "}
                {new Date(
                  order.cancelledAt,
                ).toLocaleString()}
              </p>
            )}

            {order.cancellationReason && (
              <p className="mt-2 text-sm text-red-700">
                <span className="font-medium">
                  Reason:
                </span>{" "}
                {order.cancellationReason}
              </p>
            )}

            {order.cancelledBy && (
              <p className="mt-1 text-xs text-red-500">
                Cancelled by{" "}
                {order.cancelledBy === "USER"
                  ? "customer"
                  : "admin"}
              </p>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Order Tracking */}
    {order.status !== "CANCELLED" && (
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Order Tracking
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Track the current status of your order.
          </p>
        </div>

        <div className="space-y-6">
          {statusSteps.map((step, index) => {
            const state = getStepState(
              step.status,
            );

            const Icon = step.icon;

            return (
              <div
                key={step.status}
                className="relative flex gap-4"
              >
                {index <
                  statusSteps.length - 1 && (
                  <div
                    className={`absolute left-5 top-10 h-[calc(100%+1.5rem)] w-px ${
                      state === "completed"
                        ? "bg-gray-900"
                        : "bg-gray-200"
                    }`}
                  />
                )}

                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    state === "completed"
                      ? "bg-gray-900 text-white"
                      : state === "current"
                        ? "border-2 border-gray-900 bg-white text-gray-900"
                        : "border border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="pt-1">
                  <p
                    className={`text-sm font-semibold ${
                      state === "upcoming"
                        ? "text-gray-400"
                        : "text-gray-900"
                    }`}
                  >
                    {step.label}
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      state === "upcoming"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* Order Items */}
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">
        Order Items
      </h2>

      <div className="divide-y divide-gray-100">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-24 sm:w-24">
              <ProductImage
                src={item.productImage}
                alt={item.productName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <Link
                to={`/products/${item.productSlug}`}
                className="line-clamp-2 text-sm font-medium text-gray-900 hover:underline"
              >
                {item.productName}
              </Link>

              <div className="mt-2 space-y-1 text-xs text-gray-500">
                {item.color && (
                  <p>Color: {item.color}</p>
                )}

                {item.size && (
                  <p>Size: {item.size}</p>
                )}

                <p>Quantity: {item.quantity}</p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-gray-900">
                Rs.{" "}
                {Number(
                  item.lineTotal,
                ).toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Rs.{" "}
                {Number(
                  item.unitPrice,
                ).toLocaleString()}{" "}
                each
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Delivery + Summary */}
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Delivery Information */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Delivery Information
        </h2>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">
              Customer
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {order.customerName}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Phone
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {order.customerPhone}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Address
            </p>

            <p className="mt-1 leading-6 text-gray-900">
              {order.shippingAddressLine1}

              {order.shippingAddressLine2 && (
                <>
                  <br />
                  {order.shippingAddressLine2}
                </>
              )}

              <br />
              {order.shippingCity}

              {order.shippingState && (
                <>
                  , {order.shippingState}
                </>
              )}

              {order.shippingPostalCode && (
                <>
                  {" "}
                  - {order.shippingPostalCode}
                </>
              )}

              <br />
              {order.shippingCountry}
            </p>
          </div>

          {order.notes && (
            <div>
              <p className="text-xs text-gray-500">
                Notes
              </p>

              <p className="mt-1 text-gray-900">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          Order Summary
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              Subtotal
            </span>

            <span className="font-medium text-gray-900">
              Rs.{" "}
              {Number(
                order.subtotal,
              ).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">
              Delivery
            </span>

            <span className="font-medium text-gray-900">
              Rs.{" "}
              {Number(
                order.deliveryCharge,
              ).toLocaleString()}
            </span>
          </div>

          {Number(order.discount) > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">
                Discount
              </span>

              <span className="font-medium text-green-600">
                - Rs.{" "}
                {Number(
                  order.discount,
                ).toLocaleString()}
              </span>
            </div>
          )}

          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">
                Total
              </span>

              <span className="text-lg font-bold text-gray-900">
                Rs.{" "}
                {Number(
                  order.total,
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Clock className="h-5 w-5 text-gray-500" />

            <div>
              <p className="text-xs text-gray-500">
                Payment Method
              </p>

              <p className="text-sm font-medium text-gray-900">
                Cash on Delivery
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Actions */}
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
      <Link
        to="/products"
        className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        Continue Shopping
      </Link>

      <Link
        to="/account/orders"
        className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        View All Orders
      </Link>
    </div>
  </div>

  {/* Cancellation Dialog */}
  {showCancelDialog && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-order-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="cancel-order-title"
              className="text-lg font-semibold text-gray-900"
            >
              Cancel Order
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Are you sure you want to cancel this
              order?
            </p>
          </div>

          <button
            type="button"
            onClick={handleCloseCancelDialog}
            disabled={
              cancelOrderMutation.isPending
            }
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close cancellation dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label
          htmlFor="cancel-reason"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Cancellation reason
        </label>

        <textarea
          id="cancel-reason"
          value={cancelReason}
          onChange={(event) => {
            setCancelReason(event.target.value);
            setCancelError("");
          }}
          placeholder="Please tell us why you want to cancel this order..."
          maxLength={255}
          rows={4}
          disabled={
            cancelOrderMutation.isPending
          }
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-50"
        />

        <div className="mt-1 text-right text-xs text-gray-400">
          {cancelReason.length}/255
        </div>

        {cancelError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />

            <span>{cancelError}</span>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCloseCancelDialog}
            disabled={
              cancelOrderMutation.isPending
            }
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep Order
          </button>

          <button
            type="button"
            onClick={handleCancelOrder}
            disabled={
              cancelOrderMutation.isPending ||
              cancelReason.trim().length < 3
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelOrderMutation.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Confirm Cancellation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )}
</>

);
};

export default OrderConfirmationPage;