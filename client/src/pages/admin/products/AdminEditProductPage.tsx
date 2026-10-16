import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AdminProductForm from "../../../features/products/components/AdminProductForm";
import AdminVariantForm from "../../../features/products/components/AdminVariantForm";
import AdminVariantList from "../../../features/products/components/AdminVariantList";

import { useCategories } from "../../../features/categories/useCategories";
import { useAdminProduct } from "../../../features/products/useAdminProducts";

const AdminEditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [editingVariantId, setEditingVariantId] =
    useState<string | null>(null);

  const {
    data: productData,
    isLoading: isLoadingProduct,
    isError: isProductError,
  } = useAdminProduct(id);

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useCategories();

  const categoryList = Array.isArray(categories)
    ? categories
    : [];

  if (!id) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Invalid product ID.
      </div>
    );
  }

  if (isLoadingProduct) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border bg-white p-6">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />

          <div className="mt-6 space-y-4">
            <div className="h-10 animate-pulse rounded bg-gray-200" />
            <div className="h-10 animate-pulse rounded bg-gray-200" />
            <div className="h-32 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (isProductError || !productData?.data) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load product.
        </div>
      </div>
    );
  }

  const product = productData.data;

  const variants = product.variants ?? [];

  const editingVariant = editingVariantId
    ? variants.find(
        (variant) => variant.id === editingVariantId
      )
    : undefined;

  const handleVariantSuccess = () => {
    setIsAddingVariant(false);
    setEditingVariantId(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="mt-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Edit Product
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Update product information, pricing, images, and variants.
          </p>
        </div>
      </div>

      {isCategoriesError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load categories.
        </div>
      )}

      <AdminProductForm
        product={product}
        categories={categoryList.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        isLoadingCategories={isLoadingCategories}
        onSuccess={() => navigate("/admin/products")}
      />

      {!isAddingVariant && !editingVariantId && (
        <AdminVariantList
          variants={variants}
          onAdd={() => {
            setEditingVariantId(null);
            setIsAddingVariant(true);
          }}
          onEdit={(variant) => {
            setIsAddingVariant(false);
            setEditingVariantId(variant.id);
          }}
        />
      )}

      {isAddingVariant && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">
              Add Variant
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Add a size, color, SKU, and price for this product.
            </p>
          </div>

          <AdminVariantForm
            productId={product.id}
            onSuccess={handleVariantSuccess}
            onCancel={() => setIsAddingVariant(false)}
          />
        </div>
      )}

      {editingVariantId && editingVariant && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold text-gray-900">
              Edit Variant
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Update the selected product variant.
            </p>
          </div>

          <AdminVariantForm
            productId={product.id}
            variant={editingVariant}
            onSuccess={handleVariantSuccess}
            onCancel={() => setEditingVariantId(null)}
          />
        </div>
      )}
    </div>
  );
};

export default AdminEditProductPage;