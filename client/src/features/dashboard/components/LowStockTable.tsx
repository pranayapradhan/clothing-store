import { AlertTriangle, Package } from "lucide-react";

import type {
DashboardLowStockItem,
} from "../dashboard.types";

interface LowStockTableProps {
items: DashboardLowStockItem[];
}

const LowStockTable = ({
items,
}: LowStockTableProps) => {
return (
<section className="rounded-xl border bg-white shadow-sm">
<div className="flex items-center justify-between border-b px-5 py-4">
<div>
<h3 className="text-base font-semibold text-gray-900">
Low Stock
</h3>

      <p className="mt-1 text-sm text-gray-500">
        Products that need inventory attention.
      </p>
    </div>

    <div className="rounded-lg bg-yellow-50 p-2">
      <AlertTriangle className="h-5 w-5 text-yellow-600" />
    </div>
  </div>

  {items.length === 0 ? (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
      <div className="rounded-full bg-green-50 p-3">
        <Package className="h-6 w-6 text-green-600" />
      </div>

      <p className="mt-3 text-sm font-medium text-gray-900">
        Inventory looks good
      </p>

      <p className="mt-1 text-sm text-gray-500">
        No products are currently low on stock.
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
                Product
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                SKU
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Variant
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Available
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Threshold
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {items.map((item) => (
              <tr
                key={item.variantId}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="px-5 py-4">
                  <p className="max-w-[220px] truncate text-sm font-medium text-gray-900">
                    {item.productName}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-gray-600">
                    {item.sku}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {item.color && (
                      <span className="text-sm text-gray-700">
                        {item.color}
                      </span>
                    )}

                    {item.color && item.size && (
                      <span className="text-gray-300">
                        /
                      </span>
                    )}

                    {item.size && (
                      <span className="text-sm text-gray-700">
                        {item.size}
                      </span>
                    )}

                    {!item.color && !item.size && (
                      <span className="text-sm text-gray-400">
                        —
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {item.availableQuantity}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <p className="text-sm text-gray-600">
                    {item.lowStockThreshold}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="divide-y md:hidden">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {item.productName}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  SKU: {item.sku}
                </p>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                {item.availableQuantity}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Variant
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {item.color || "—"}
                  {item.color && item.size ? " / " : ""}
                  {item.size || ""}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Threshold
                </p>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {item.lowStockThreshold}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )}
</section>

);
};

export default LowStockTable;