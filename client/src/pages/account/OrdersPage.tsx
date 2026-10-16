import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
ArrowRight,
Package,
ShoppingBag,
} from "lucide-react";

import ProductImage from "../../features/products/ProductImage";
import { useOrders } from "../../features/orders/useOrders";

const getStatusClasses = (status: string) => {
switch (status) {
case "CONFIRMED":
return "bg-blue-50 text-blue-700";


case "PROCESSING":
  return "bg-purple-50 text-purple-700";

case "SHIPPED":
  return "bg-indigo-50 text-indigo-700";

case "DELIVERED":
  return "bg-green-50 text-green-700";

case "CANCELLED":
  return "bg-red-50 text-red-700";

case "PENDING":
default:
  return "bg-yellow-50 text-yellow-700";


}
};

const OrdersPage = () => {
const {
data,
isLoading,
isError,
refetch,
} = useOrders();

const orders = data?.data ?? [];

if (isLoading) {
return ( <div className="px-4 py-8 sm:px-6 lg:px-8"> <div className="mx-auto max-w-5xl"> <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />


      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-40 animate-pulse rounded-2xl bg-gray-200"
          />
        ))}
      </div>
    </div>
  </div>
);


}

if (isError) {
return ( <div className="flex min-h-[60vh] items-center justify-center px-4"> <div className="text-center"> <Package className="mx-auto h-12 w-12 text-gray-400" />


      <h1 className="mt-4 text-xl font-semibold text-gray-900">
        Unable to load your orders
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Something went wrong while loading your order history.
      </p>

      <button
        type="button"
        onClick={() => refetch()}
        className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        Try Again
      </button>
    </div>
  </div>
);


}

if (orders.length === 0) {
return ( <div className="flex min-h-[60vh] items-center justify-center px-4"> <div className="text-center"> <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"> <ShoppingBag className="h-8 w-8 text-gray-500" /> </div>


      <h1 className="mt-5 text-2xl font-semibold text-gray-900">
        No orders yet
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        Your completed orders will appear here.
      </p>

      <Link
        to="/products"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
      >
        Start Shopping
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </div>
);


}

return ( <div className="bg-gray-50 px-4 py-8 sm:px-6 lg:px-8"> <div className="mx-auto max-w-5xl">
<motion.div
initial={{ opacity: 0, y: 15 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.35 }}
> <div> <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
My Orders </h1>


        <p className="mt-1 text-sm text-gray-500">
          View and track your recent orders.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {orders.map((order) => {
          const firstItem = order.items[0];

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >
              {/* Header */}
              <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Order
                  </p>

                  <p className="mt-1 font-semibold text-gray-900">
                    #{order.orderNumber}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>

                  <span className="text-xs text-gray-500">
                    {new Date(
                      order.createdAt,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6">
                <div className="flex gap-4">
                  {firstItem && (
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-24 sm:w-24">
                      <ProductImage
                        src={firstItem.productImage}
                        alt={firstItem.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {firstItem && (
                      <>
                        <h2 className="truncate font-medium text-gray-900">
                          {firstItem.productName}
                        </h2>

                        <div className="mt-1 space-y-1 text-sm text-gray-500">
                          {firstItem.color && (
                            <p>
                              Color: {firstItem.color}
                            </p>
                          )}

                          {firstItem.size && (
                            <p>
                              Size: {firstItem.size}
                            </p>
                          )}

                          <p>
                            Quantity: {firstItem.quantity}
                          </p>
                        </div>
                      </>
                    )}

                    {order.items.length > 1 && (
                      <p className="mt-2 text-xs font-medium text-gray-500">
                        + {order.items.length - 1} more{" "}
                        {order.items.length - 1 === 1
                          ? "item"
                          : "items"}
                      </p>
                    )}
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-gray-500">
                      Total
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      Rs.{" "}
                      {Number(order.total).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Mobile total */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 sm:hidden">
                  <span className="text-sm text-gray-500">
                    Total
                  </span>

                  <span className="font-bold text-gray-900">
                    Rs.{" "}
                    {Number(order.total).toLocaleString()}
                  </span>
                </div>

                {/* Footer */}
                <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-500">
                    <span>
                      {order.items.length}{" "}
                      {order.items.length === 1
                        ? "item"
                        : "items"}
                    </span>

                    <span className="mx-2">•</span>

                    <span>
                      Cash on Delivery
                    </span>
                  </div>

                  <Link
                    to={`/account/orders/${order.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                  >
                    View Order
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  </div>
</div>


);
};

export default OrdersPage;
