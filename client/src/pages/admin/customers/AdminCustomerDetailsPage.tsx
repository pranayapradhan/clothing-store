
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  UserRound,
  ShoppingBag,
  Wallet,
  CalendarDays,
} from "lucide-react";

import { useAdminCustomer } from "../../../features/customers/useAdminCustomers";
import type { OrderStatus } from "../../../features/orders/order.types";

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-purple-50 text-purple-700",
  SHIPPED: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

const formatMoney = (amount: string | number) =>
  `Rs. ${Number(amount).toLocaleString("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const AdminCustomerDetailsPage = () => {
  const { id = "" } = useParams<{ id: string }>();

  const { data, isLoading, isError, refetch } = useAdminCustomer(id);

  const customer = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-72 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-8">
        <p className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={18} />
          Unable to load customer details.
        </p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="text-sm font-medium underline"
        >
          Try again
        </button>

        <Link
          to="/admin/customers"
          className="block text-sm text-gray-600 hover:text-gray-900"
        >
          Back to customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/customers"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to customers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {customer.name}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Customer profile and order history
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            customer.isActive
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {customer.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ShoppingBag size={17} />
            Total orders
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-900">
            {customer.totalOrders}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Wallet size={17} />
            Confirmed spending
          </div>

          <p className="mt-3 text-2xl font-bold text-gray-900">
            {formatMoney(customer.totalSpent)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CalendarDays size={17} />
            Joined
          </div>

          <p className="mt-3 text-lg font-semibold text-gray-900">
            {new Date(customer.createdAt).toLocaleDateString("en-NP")}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
          <UserRound size={20} />
          Customer information
        </h2>

        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Full name
            </dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {customer.name}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Email address
            </dt>
            <dd className="mt-1 break-all text-sm text-gray-900">
              {customer.email}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Account status
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {customer.isActive ? "Active" : "Inactive"}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Last account update
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(customer.updatedAt).toLocaleString("en-NP")}
            </dd>
          </div>
        </dl>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Order history
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            All orders placed by this customer
          </p>
        </div>

        {customer.orders.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingBag
              size={30}
              className="mx-auto mb-3 text-gray-400"
            />
            <p className="font-medium text-gray-900">
              No orders yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              This customer hasn't placed any orders.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {customer.orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {order.orderNumber}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString(
                        "en-NP",
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-medium">
                      {formatMoney(order.total)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusStyles[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          order.paymentStatus === "PAID"
                            ? "font-medium text-green-700"
                            : "font-medium text-amber-700"
                        }
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-medium text-gray-900 underline-offset-4 hover:underline"
                      >
                        View order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminCustomerDetailsPage;
