import { Edit, PackageX, Plus, Trash2 } from "lucide-react";

import { useDeleteAdminVariant } from "../useAdminProducts";

interface Variant {
  id: string;
  color: string;
  colorCode: string;
  size: string;
  sku: string;
  price: string;
  isActive: boolean;
}

interface AdminVariantListProps {
  variants: Variant[];
  onAdd: () => void;
  onEdit: (variant: Variant) => void;
}

const AdminVariantList = ({
  variants,
  onAdd,
  onEdit,
}: AdminVariantListProps) => {
  const deleteVariant = useDeleteAdminVariant();

  const handleDelete = async (variant: Variant) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete variant "${variant.sku}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteVariant.mutateAsync(variant.id);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete variant."
      );
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Product Variants
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Manage sizes, colors, SKUs, and variant pricing.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Variant
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <PackageX className="h-10 w-10 text-gray-400" />

          <h4 className="mt-4 text-sm font-semibold text-gray-900">
            No variants yet
          </h4>

          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Add at least one variant with its size, color, SKU,
            and price.
          </p>

          <button
            type="button"
            onClick={onAdd}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Add First Variant
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Color
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Size
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    SKU
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Price
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {variants.map((variant) => (
                  <tr key={variant.id}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {variant.colorCode && (
                          <span
                            className="h-5 w-5 rounded-full border border-gray-300"
                            style={{
                              backgroundColor:
                                variant.colorCode,
                            }}
                          />
                        )}

                        <span className="text-sm text-gray-900">
                          {variant.color || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {variant.size || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {variant.sku}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      Rs. {Number(variant.price).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          variant.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {variant.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(variant)}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          title="Edit variant"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(variant)}
                          disabled={deleteVariant.isPending}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete variant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-gray-100 md:hidden">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="space-y-4 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      {variant.colorCode && (
                        <span
                          className="h-5 w-5 rounded-full border border-gray-300"
                          style={{
                            backgroundColor:
                              variant.colorCode,
                          }}
                        />
                      )}

                      <p className="font-medium text-gray-900">
                        {variant.color || "No color"}
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      Size: {variant.size || "—"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      variant.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {variant.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      SKU
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {variant.sku}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Price
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-900">
                      Rs.{" "}
                      {Number(
                        variant.price
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(variant)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(variant)}
                    disabled={deleteVariant.isPending}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2.5 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminVariantList;