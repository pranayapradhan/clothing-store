import { Link } from "react-router-dom";
import type { DashboardRecentOrder } from "../dashboard.types";

interface RecentOrdersProps {
orders: DashboardRecentOrder[];
}

const getStatusClasses = (
status: DashboardRecentOrder["status"],
) => {
switch (status) {
case "PENDING":
return "bg-yellow-100 text-yellow-700";

case "CONFIRMED":
  return "bg-blue-100 text-blue-700";

case "PROCESSING":
  return "bg-purple-100 text-purple-700";

case "SHIPPED":
  return "bg-indigo-100 text-indigo-700";

case "DELIVERED":
  return "bg-green-100 text-green-700";

case "CANCELLED":
  return "bg-red-100 text-red-700";

default:
  return "bg-gray-100 text-gray-700";

}
};

const formatDate = (date: string) => {
return new Date(date).toLocaleDateString("en-NP", {
year: "numeric",
month: "short",
day: "numeric",
});
};

const RecentOrders = ({
orders,
}: RecentOrdersProps) => {
return (
<section className="rounded-xl border bg-white shadow-sm">
<div className="flex items-center justify-between border-b px-5 py-4">
<div>
<h3 className="text-base font-semibold text-gray-900">
Recent Orders
</h3>

      <p className="mt-1 text-sm text-gray-500">
        Latest orders placed in your store.
      </p>
    </div>

    <Link
      to="/admin/orders"
      className="text-sm font-medium text-gray-900 hover:underline"
    >
      View all
    </Link>
  </div>

  {orders.length === 0 ? (
    <div className="px-5 py-10 text-center">
      <p className="text-sm text-gray-500">
        No orders found.
      </p>
    </div>
  ) : (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Order
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Customer
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Total
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {order.orderNumber}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="max-w-[180px] truncate text-sm text-gray-700">
                    {order.customerName}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-gray-900">
                    Rs. {order.total.toLocaleString()}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={[
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                      getStatusClasses(order.status),
                    ].join(" ")}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <p className="whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </td>

                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="divide-y md:hidden">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {order.orderNumber}
                </p>

                <p className="mt-1 truncate text-sm text-gray-500">
                  {order.customerName}
                </p>
              </div>

              <span
                className={[
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                  getStatusClasses(order.status),
                ].join(" ")}
              >
                {order.status}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Rs. {order.total.toLocaleString()}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <Link
                to={`/account/orders/${order.id}`}
                className="text-sm font-medium text-gray-900 hover:underline"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  )}
</section>

);
};

export default RecentOrders;