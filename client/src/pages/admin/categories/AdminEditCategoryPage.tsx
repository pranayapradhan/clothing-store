import { useNavigate, useParams } from "react-router-dom";

import AdminCategoryForm from "../../../features/categories/components/AdminCategoryForm";

import {
  useAdminCategories,
  useAdminCategory,
  useUpdateCategory,
} from "../../../features/categories/useAdminCategories";

export default function AdminEditCategoryPage() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const categoryId = id ?? "";

  const {
    data: category,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
  } = useAdminCategory(categoryId);

  const {
    data: categories,
  } = useAdminCategories();

  const categoryList = Array.isArray(categories)
    ? categories
    : [];

  const updateMutation = useUpdateCategory();

  const handleSubmit = (
    payload: Parameters<
      typeof updateMutation.mutate
    >[0]["payload"]
  ) => {
    if (!categoryId) {
      return;
    }

    updateMutation.mutate(
      {
        categoryId,
        payload,
      },
      {
        onSuccess: () => {
          navigate("/admin/categories");
        },
      }
    );
  };

  if (isCategoryLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="space-y-5">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-11 animate-pulse rounded-lg bg-gray-100"
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  if (
    !category ||
    isCategoryError ||
    !categoryId
  ) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Category
          </h1>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Category could not be found.
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/categories")
          }
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Edit Category
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update the details for "{category.name}".
        </p>
      </div>

      <AdminCategoryForm
        categories={categoryList}
        initialCategory={category}
        isSubmitting={updateMutation.isPending}
        error={
          updateMutation.isError
            ? "Failed to update category. Please check the category details and try again."
            : null
        }
        onSubmit={handleSubmit}
      />
    </div>
  );
}