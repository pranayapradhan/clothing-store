import { Link } from "react-router-dom";
import type { Category } from "./category.service";

interface AdminCategoryTableProps {
  categories: Category[];
  onDeactivate: (categoryId: string) => void;
  onActivate: (categoryId: string) => void;
  isActionPending?: boolean;
}

export default function AdminCategoryTable({
  categories,
  onDeactivate,
  onActivate,
  isActionPending = false,
}: AdminCategoryTableProps) {
  const getParentName = (parentId: string | null) => {
    if (!parentId) {
      return "Top Level";
    }

    const parent = categories.find(
      (category) => category.id === parentId
    );

    return parent?.name ?? "—";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[850px]">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Category
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Slug
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Parent
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Sort Order
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {categories.map((category) => (
              <tr
                key={category.id}
                className="transition hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {category.name}
                    </p>

                    {category.description && (
                      <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                        {category.description}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {category.slug}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {getParentName(category.parentId)}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {category.sortOrder}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge isActive={category.isActive} />
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/admin/categories/${category.id}/edit`}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      Edit
                    </Link>

                    {category.isActive ? (
                      <button
                        type="button"
                        onClick={() => onDeactivate(category.id)}
                        disabled={isActionPending}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onActivate(category.id)}
                        disabled={isActionPending}
                        className="rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="divide-y divide-gray-100 md:hidden">
        {categories.map((category) => (
          <div key={category.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900">
                  {category.name}
                </h3>

                <p className="mt-1 truncate text-sm text-gray-500">
                  {category.slug}
                </p>
              </div>

              <StatusBadge isActive={category.isActive} />
            </div>

            {category.description && (
              <p className="mt-3 line-clamp-2 text-sm text-gray-500">
                {category.description}
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Parent</p>
                <p className="mt-1 font-medium text-gray-800">
                  {getParentName(category.parentId)}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Sort Order</p>
                <p className="mt-1 font-medium text-gray-800">
                  {category.sortOrder}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                to={`/admin/categories/${category.id}/edit`}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Edit
              </Link>

              {category.isActive ? (
                <button
                  type="button"
                  onClick={() => onDeactivate(category.id)}
                  disabled={isActionPending}
                  className="flex-1 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Deactivate
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onActivate(category.id)}
                  disabled={isActionPending}
                  className="flex-1 rounded-lg border border-green-200 px-3 py-2.5 text-sm font-medium text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}