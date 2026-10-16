import { Link } from "react-router-dom";
import { Package, Settings } from "lucide-react";

import type { Inventory } from "../inventory.types";

interface InventoryRow {
  inventory: Inventory | null;
  variant: {
    id: string;
    color: string;
    size: string;
    sku: string;
    price: string;
    isActive: boolean;
  };
  product: {
    id: string;
    name: string;
  };
}

interface AdminInventoryTableProps {
  rows: InventoryRow[];
  isLoading?: boolean;
}

const getStockStatus = (inventory: Inventory | null) => {
  if (!inventory) {
    return {
      label: "Not Initialized",
      className: "bg-gray-100 text-gray-600",
    };
  }

  const available = inventory.quantity - inventory.reservedQuantity;

  if (available <= 0) {
    return {
      label: "Out of Stock",
      className: "bg-red-100 text-red-700",
    };
  }

  if (available <= inventory.lowStockThreshold) {
    return {
      label: "Low Stock",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  return {
    label: "In Stock",
    className: "bg-green-100 text-green-700",
  };
};

const AdminInventoryTable = ({
  rows,
  isLoading = false,
}: AdminInventoryTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="hidden md:block">
          <div className="space-y-4 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 p-5 md:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
        <Package className="mx-auto h-10 w-10 text-gray-400" />

        <h3 className="mt-4 text-sm font-semibold text-gray-900">
          No inventory found
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Product variants will appear here once they are available.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Product
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Variant
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                SKU
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Stock
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Reserved
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Available
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => {
              const status = getStockStatus(row.inventory);

              const quantity = row.inventory?.quantity ?? 0;

              const reserved = row.inventory?.reservedQuantity ?? 0;

              const available = quantity - reserved;

              return (
                <tr key={row.variant.id}>
                  <td className="px-5 py-4">
                    <p className="max-w-xs truncate text-sm font-medium text-gray-900">
                      {row.product.name}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {row.variant.color && (
                        <span className="text-sm text-gray-700">
                          {row.variant.color}
                        </span>
                      )}

                      {row.variant.size && (
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {row.variant.size}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    {row.variant.sku}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700">
                    {quantity}
                  </td>

                  <td className="px-5 py-4 text-sm text-gray-700">
                    {reserved}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                    {available}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    {row.inventory ? (
                      <Link
                        to={`/admin/inventory/${row.variant.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {" "}
                        <Settings className="h-4 w-4" /> Manage{" "}
                      </Link>
                    ) : (
                      <Link
                        to={`/admin/inventory/${row.variant.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {" "}
                        <Package className="h-4 w-4" /> Initialize{" "}
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-gray-100 md:hidden">
        {rows.map((row) => {
          const status = getStockStatus(row.inventory);

          const quantity = row.inventory?.quantity ?? 0;

          const reserved = row.inventory?.reservedQuantity ?? 0;

          const available = quantity - reserved;

          return (
            <div key={row.variant.id} className="space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {row.product.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {row.variant.sku}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                {row.variant.color && (
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-gray-700">
                    Color: {row.variant.color}
                  </span>
                )}

                {row.variant.size && (
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-gray-700">
                    Size: {row.variant.size}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Stock</p>

                  <p className="mt-1 font-semibold text-gray-900">{quantity}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Reserved</p>

                  <p className="mt-1 font-semibold text-gray-900">{reserved}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Available</p>

                  <p className="mt-1 font-semibold text-gray-900">
                    {available}
                  </p>
                </div>
              </div>

              {row.inventory ? (
                <Link
                  to={`/admin/inventory/${row.variant.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {" "}
                  <Settings className="h-4 w-4" /> Manage Inventory{" "}
                </Link>
              ) : (
                <Link
                  to={`/admin/inventory/${row.variant.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {" "}
                  <Package className="h-4 w-4" /> Initialize Inventory{" "}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminInventoryTable;
