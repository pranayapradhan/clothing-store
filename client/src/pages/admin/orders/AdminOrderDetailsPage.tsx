import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Package,
  MapPin,
  User,
} from "lucide-react";

import {
  useAdminOrder,
  useUpdateAdminOrderStatus,
  useConfirmAdminOrderPayment,
} from "../../../features/orders/useAdminOrders";

import type { OrderStatus } from "../../../features/orders/order.types";

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const formatMoney = (value: string) =>
  `Rs. ${Number(value).toLocaleString("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const AdminOrderDetailsPage = () => {
  const { id = "" } = useParams<{ id: string }>();

  const { data, isLoading, isError, refetch } = useAdminOrder(id);
  const updateStatus = useUpdateAdminOrderStatus();

  const confirmPayment = useConfirmAdminOrderPayment();

  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const order = data?.data;
  const availableStatuses = order ? allowedTransitions[order.status] : [];

  const handleUpdate = async () => {
    if (!order || !selectedStatus) return;

    if (
      selectedStatus === "CANCELLED" &&
      !window.confirm("Cancel this order and release reserved inventory?")
    ) {
      return;
    }

    setMessage("");

    try {
      await updateStatus.mutateAsync({
        orderId: order.id,
        payload: {
          status: selectedStatus,
          ...(selectedStatus === "CANCELLED"
            ? { reason: reason.trim() || "Cancelled by admin" }
            : {}),
        },
      });

      setSelectedStatus("");
      setReason("");
      setMessage("Order status updated successfully.");
    } catch {
      setMessage("Failed to update order status. Please try again.");
    }
  };

  const handleConfirmPayment = async () => {
    if (!order || confirmPayment.isPending) return;

    const confirmed = window.confirm(
      "Have you received the full cash payment for this order?",
    );

    if (!confirmed) return;

    setPaymentMessage("");
    setPaymentError(false);

    try {
      await confirmPayment.mutateAsync(order.id);

      setPaymentMessage("COD payment confirmed successfully.");
    } catch (error) {
      setPaymentError(true);

      setPaymentMessage(
        error instanceof Error ? error.message : "Failed to confirm payment.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-sm text-gray-500">Loading order details...</div>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-4 rounded-xl border bg-white p-8">
        <p className="flex items-center gap-2 text-red-600">
          <AlertCircle size={18} />
          Unable to load order details.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="text-sm font-medium underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Placed {new Date(order.createdAt).toLocaleString("en-NP")}
          </p>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold">
          {order.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Package size={18} />
              Order items
            </h2>

            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 py-4">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-gray-100" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      {item.color} / {item.size}
                    </p>
                    <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                    <p className="mt-1 text-sm">
                      {formatMoney(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">{formatMoney(item.lineTotal)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{formatMoney(order.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{formatMoney(order.discount)}</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-bold">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-semibold">Update order status</h2>

            {availableStatuses.length === 0 ? (
              <p className="text-sm text-gray-500">
                No further status updates are available.
              </p>
            ) : (
              <div className="space-y-4">
                <select
                  value={selectedStatus}
                  onChange={(event) => {
                    setSelectedStatus(event.target.value as OrderStatus | "");
                    setMessage("");
                  }}
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm"
                >
                  <option value="">Select new status</option>
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                {selectedStatus === "CANCELLED" && (
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    maxLength={255}
                    placeholder="Reason for cancellation"
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 p-3 text-sm"
                  />
                )}

                <button
                  type="button"
                  disabled={!selectedStatus || updateStatus.isPending}
                  onClick={() => void handleUpdate()}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {updateStatus.isPending && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Update status
                </button>
              </div>
            )}

            {message && (
              <p role="status" className="mt-3 text-sm text-gray-700">
                {message}
              </p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <User size={18} />
              Customer
            </h2>
            <p className="font-medium">{order.customerName}</p>
            <p className="mt-1 text-sm text-gray-600">{order.customerEmail}</p>
            <p className="mt-1 text-sm text-gray-600">{order.customerPhone}</p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <MapPin size={18} />
              Shipping address
            </h2>
            <div className="space-y-1 text-sm text-gray-600">
              <p>{order.shippingAddressLine1}</p>
              {order.shippingAddressLine2 && (
                <p>{order.shippingAddressLine2}</p>
              )}
              <p>
                {order.shippingCity}
                {order.shippingState ? `, ${order.shippingState}` : ""}
              </p>
              {order.shippingPostalCode && <p>{order.shippingPostalCode}</p>}
              <p>{order.shippingCountry}</p>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-semibold">Payment</h2>

            <div className="space-y-2 text-sm">
              <p>
                Method:{" "}
                <span className="font-medium">{order.paymentMethod}</span>
              </p>

              <p>
                Status:{" "}
                <span
                  className={
                    order.paymentStatus === "PAID"
                      ? "font-semibold text-green-700"
                      : "font-semibold text-amber-700"
                  }
                >
                  {order.paymentStatus}
                </span>
              </p>

              <p>
                Amount:{" "}
                <span className="font-semibold">
                  {formatMoney(order.total)}
                </span>
              </p>
            </div>

            {order.status === "DELIVERED" &&
              order.paymentMethod === "COD" &&
              order.paymentStatus === "PENDING" && (
                <button
                  type="button"
                  onClick={() => void handleConfirmPayment()}
                  disabled={confirmPayment.isPending}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {confirmPayment.isPending && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Confirm COD Payment
                </button>
              )}

            {paymentMessage && (
              <p
                role={paymentError ? "alert" : "status"}
                className={`mt-3 text-sm ${
                  paymentError ? "text-red-600" : "text-green-700"
                }`}
              >
                {paymentMessage}
              </p>
            )}
          </section>

          {order.notes && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 font-semibold">Customer notes</h2>
              <p className="whitespace-pre-wrap text-sm text-gray-600">
                {order.notes}
              </p>
            </section>
          )}

          {order.status === "CANCELLED" && (
            <section className="rounded-xl border border-red-200 bg-white p-5">
              <h2 className="mb-3 font-semibold">Cancellation</h2>
              <p className="text-sm">By: {order.cancelledBy ?? "Unknown"}</p>
              <p className="mt-1 text-sm">
                Reason: {order.cancellationReason ?? "Not provided"}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailsPage;
