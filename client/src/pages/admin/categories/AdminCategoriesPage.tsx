import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminCategoryTable from "../../../features/categories/AdminCategoryTable";
import {
  useAdminCategories,
  useActivateCategory,
  useDeactivateCategory,
} from "../../../features/categories/useAdminCategories";

export default function AdminCategoriesPage() {
  const { data: categories, isLoading, isError } = useAdminCategories();

  const activateMutation = useActivateCategory();
  const deactivateMutation = useDeactivateCategory();

  const [search, setSearch] = useState("");
  const [categoryToDeactivate, setCategoryToDeactivate] = useState<
    string | null
  >(null);

  const categoryList = Array.isArray(categories) ? categories : [];

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categoryList;
    }

    return categoryList.filter((category) => {
      return (
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        (category.description ?? "").toLowerCase().includes(query)
      );
    });
  }, [categories, search]);

  const handleDeactivate = () => {
    if (!categoryToDeactivate) return;

    deactivateMutation.mutate(categoryToDeactivate, {
      onSuccess: () => {
        setCategoryToDeactivate(null);
      },
    });
  };

  const handleActivate = (categoryId: string) => {
    activateMutation.mutate(categoryId);
  };

  const isActionPending =
    activateMutation.isPending || deactivateMutation.isPending;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Categories
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage product categories and their status.
          </p>
        </div>

        <Link
          to="/admin/categories/new"
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Add Category
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <label
          htmlFor="category-search"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Search categories
        </label>

        <input
          id="category-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, slug or description..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
        />
      </div>

      {isLoading && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading categories...
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load categories. Please try again.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {filteredCategories.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-gray-500">
                {search.trim()
                  ? "No categories match your search."
                  : "No categories found."}
              </p>

              {!search.trim() && (
                <Link
                  to="/admin/categories/new"
                  className="mt-4 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Create Category
                </Link>
              )}
            </div>
          ) : (
            <AdminCategoryTable
              categories={filteredCategories}
              onDeactivate={setCategoryToDeactivate}
              onActivate={handleActivate}
              isActionPending={isActionPending}
            />
          )}
        </>
      )}

      {categoryToDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Deactivate Category?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This category will become inactive and will no longer be
              available as an active category on the storefront. You can
              activate it again later.
            </p>

            {deactivateMutation.isError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                Failed to deactivate the category. Please try again.
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCategoryToDeactivate(null)}
                disabled={deactivateMutation.isPending}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeactivate}
                disabled={deactivateMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deactivateMutation.isPending
                  ? "Deactivating..."
                  : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}