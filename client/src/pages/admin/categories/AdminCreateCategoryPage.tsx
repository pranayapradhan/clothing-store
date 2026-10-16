import { useNavigate } from "react-router-dom";

import AdminCategoryForm from "../../../features/categories/components/AdminCategoryForm";
import {
  useAdminCategories,
  useCreateCategory,
} from "../../../features/categories/useAdminCategories";

export default function AdminCreateCategoryPage() {
  const navigate = useNavigate();

  const {
    data: categories = [],
  } = useAdminCategories();

  const createMutation = useCreateCategory();

  const handleSubmit = (payload: Parameters<
    typeof createMutation.mutate
  >[0]) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        navigate("/admin/categories");
      },
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Create Category
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new category for your clothing products.
        </p>
      </div>

      <AdminCategoryForm
        categories={categories}
        isSubmitting={createMutation.isPending}
        error={
          createMutation.isError
            ? "Failed to create category. Please check the category details and try again."
            : null
        }
        onSubmit={handleSubmit}
      />
    </div>
  );
}