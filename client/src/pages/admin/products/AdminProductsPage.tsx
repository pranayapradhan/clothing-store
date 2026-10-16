import { useEffect, useState } from "react";
import {
Edit,
Package,
Plus,
Power,
PowerOff,
Search,
} from "lucide-react";
import { Link } from "react-router-dom";

import ProductImage from "../../../features/products/ProductImage";
import {
useActivateAdminProduct,
useAdminProducts,
useDeactivateAdminProduct,
} from "../../../features/products/useAdminProducts";
import type { Product } from "../../../types/product";

type ProductStatus = "all" | "active" | "inactive";

const AdminProductsPage = () => {
const [searchInput, setSearchInput] = useState("");
const [search, setSearch] = useState("");
const [status, setStatus] =
useState<ProductStatus>("all");
const [page, setPage] = useState(1);

const {
data,
isLoading,
isError,
} = useAdminProducts({
search,
status,
page,
limit: 20,
});

const deactivateMutation =
useDeactivateAdminProduct();

const activateMutation =
useActivateAdminProduct();

const [actionError, setActionError] =
useState<string | null>(null);

// ==================== SEARCH DEBOUNCE ====================

useEffect(() => {
const timer = window.setTimeout(() => {
setSearch(searchInput.trim());
setPage(1);
}, 400);

return () => {
  window.clearTimeout(timer);
};

}, [searchInput]);

const products: Product[] =
data?.data.products ?? [];

const pagination =
data?.data.pagination;

// ==================== ACTIONS ====================

const handleDeactivate = async (
productId: string
) => {
const confirmed = window.confirm(
"Are you sure you want to deactivate this product?"
);

if (!confirmed) {
  return;
}

try {
  setActionError(null);

  await deactivateMutation.mutateAsync(
    productId
  );
} catch (error) {
  setActionError(
    error instanceof Error
      ? error.message
      : "Failed to deactivate product."
  );
}

};

const handleActivate = async (
productId: string
) => {
try {
setActionError(null);

  await activateMutation.mutateAsync(
    productId
  );
} catch (error) {
  setActionError(
    error instanceof Error
      ? error.message
      : "Failed to reactivate product."
  );
}

};

const handleStatusChange = (
value: ProductStatus
) => {
setStatus(value);
setPage(1);
};

const handlePrevious = () => {
if (pagination?.hasPreviousPage) {
setPage((current) => current - 1);
}
};

const handleNext = () => {
if (pagination?.hasNextPage) {
setPage((current) => current + 1);
}
};

const isActionLoading =
deactivateMutation.isPending ||
activateMutation.isPending;

// ==================== LOADING ====================

if (isLoading) {
return (
<div className="space-y-6">
<div>
<div className="h-8 w-32 animate-pulse rounded bg-gray-200" />

      <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
    </div>

    <div className="h-20 animate-pulse rounded-xl bg-gray-200" />

    <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
  </div>
);

}

// ==================== ERROR ====================

if (isError) {
return (
<div className="rounded-xl border border-red-200 bg-red-50 p-6">
<h2 className="text-lg font-semibold text-red-700">
Failed to load products
</h2>

    <p className="mt-1 text-sm text-red-600">
      Please refresh the page and try again.
    </p>
  </div>
);

}

// ==================== PAGE ====================

return (
<div className="space-y-6">

  {/* Header */}

  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">
        Products
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Manage your clothing products and variants.
      </p>
    </div>

    <Link
      to="/admin/products/new"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
    >
      <Plus className="h-4 w-4" />
      Add Product
    </Link>
  </div>

  {/* Filters */}

  <div className="rounded-xl border bg-white p-4 shadow-sm">
    <div className="flex flex-col gap-3 md:flex-row">

      {/* Search */}

      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          value={searchInput}
          onChange={(event) =>
            setSearchInput(event.target.value)
          }
          placeholder="Search products..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Status */}

      <select
        value={status}
        onChange={(event) =>
          handleStatusChange(
            event.target.value as ProductStatus
          )
        }
        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black md:w-48"
      >
        <option value="all">
          All Products
        </option>

        <option value="active">
          Active
        </option>

        <option value="inactive">
          Inactive
        </option>
      </select>
    </div>
  </div>

  {/* Action Error */}

  {actionError && (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      {actionError}
    </div>
  )}

  {/* Products */}

  {products.length === 0 ? (
    <div className="rounded-xl border bg-white p-10 text-center">
      <Package className="mx-auto h-10 w-10 text-gray-400" />

      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No products found
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Try changing your search or status filter.
      </p>
    </div>
  ) : (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

      {/* Desktop Table */}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Product
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Category
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Price
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Variants
              </th>

              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {products.map((product) => {
              const price = Number(
                product.discountPrice ??
                  product.basePrice
              );

              const isActive =
                product.isActive;

              return (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  {/* Product */}

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={product.mainImage}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg"
                      />

                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>

                        <p className="text-sm text-gray-500">
                          {product.brand ??
                            "No brand"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.category?.name ??
                      "—"}
                  </td>

                  {/* Price */}

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Rs.{" "}
                    {price.toLocaleString()}
                  </td>

                  {/* Variants */}

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.variants?.length ??
                      0}
                  </td>

                  {/* Status */}

                  <td className="px-6 py-4">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600",
                      ].join(" ")}
                    >
                      {isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">

                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      {isActive ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeactivate(
                              product.id
                            )
                          }
                          disabled={
                            isActionLoading
                          }
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Deactivate product"
                        >
                          <PowerOff className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleActivate(
                              product.id
                            )
                          }
                          disabled={
                            isActionLoading
                          }
                          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Reactivate product"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}

      <div className="divide-y md:hidden">
        {products.map((product) => {
          const price = Number(
            product.discountPrice ??
              product.basePrice
          );

          const isActive =
            product.isActive;

          return (
            <div
              key={product.id}
              className="p-4"
            >
              <div className="flex gap-3">
                <ProductImage
                  src={product.mainImage}
                  alt={product.name}
                  className="h-16 w-16 shrink-0 rounded-lg"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {product.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {product.brand ??
                          "No brand"}
                      </p>
                    </div>

                    <span
                      className={[
                        "shrink-0 rounded-full px-2 py-1 text-xs font-medium",
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600",
                      ].join(" ")}
                    >
                      {isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Rs.{" "}
                        {price.toLocaleString()}
                      </p>

                      <p className="text-xs text-gray-500">
                        {product.variants
                          ?.length ?? 0}{" "}
                        variants
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      {isActive ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeactivate(
                              product.id
                            )
                          }
                          disabled={
                            isActionLoading
                          }
                          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Deactivate product"
                        >
                          <PowerOff className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleActivate(
                              product.id
                            )
                          }
                          disabled={
                            isActionLoading
                          }
                          className="rounded-lg p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 disabled:opacity-50"
                          title="Reactivate product"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* Pagination */}

  {pagination && pagination.total > 0 && (
    <div className="flex flex-col gap-3 rounded-xl border bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

      <p className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-medium text-gray-900">
          {(pagination.page - 1) *
            pagination.limit +
            1}
        </span>
        {" "}–{" "}
        <span className="font-medium text-gray-900">
          {Math.min(
            pagination.page *
              pagination.limit,
            pagination.total
          )}
        </span>
        {" "}of{" "}
        <span className="font-medium text-gray-900">
          {pagination.total}
        </span>
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={
            !pagination.hasPreviousPage
          }
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={
            !pagination.hasNextPage
          }
          className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )}
</div>

);
};

export default AdminProductsPage;