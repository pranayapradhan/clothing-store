import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import AdminProductForm from "../../../features/products/components/AdminProductForm";
import { useCategories } from "../../../features/categories/useCategories";

const AdminCreateProductPage = () => {
const navigate = useNavigate();

const {
data: categories = [],
isLoading: isLoadingCategories,
isError: isCategoriesError,
} = useCategories();

return (
<div className="mx-auto max-w-5xl space-y-6">

  {/* Header */}

  <div>
    <Link
      to="/admin/products"
      className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-black"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Products
    </Link>

    <div className="mt-4">
      <h2 className="text-2xl font-bold text-gray-900">
        Add Product
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Create a new clothing product.
      </p>
    </div>
  </div>

  {/* Category Error */}

  {isCategoriesError && (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      Failed to load categories. Please refresh the page and try again.
    </div>
  )}

  {/* Form */}

  <AdminProductForm
    categories={categories.map((category) => ({
      id: category.id,
      name: category.name,
    }))}
    isLoadingCategories={isLoadingCategories}
    onSuccess={() =>
      navigate("/admin/products")
    }
  />
</div>

);
};

export default AdminCreateProductPage;