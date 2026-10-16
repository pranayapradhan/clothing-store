import { useEffect, useState } from "react";

import type { Category } from "../category.service";

interface AdminCategoryFormProps {
  categories: Category[];
  initialCategory?: Category;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (payload: {
    name: string;
    slug?: string;
    description?: string;
    image?: string;
    parentId?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  }) => void;
}

interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string;
  isActive: boolean;
  sortOrder: number;
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getInitialValues(
  category?: Category
): CategoryFormValues {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    image: category?.image ?? "",
    parentId: category?.parentId ?? "",
    isActive: category?.isActive ?? true,
    sortOrder: category?.sortOrder ?? 0,
  };
}

function normalizeValues(
  values: CategoryFormValues
): CategoryFormValues {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
    image: values.image.trim(),
    parentId: values.parentId || "",
    isActive: values.isActive,
    sortOrder: values.sortOrder,
  };
}

export default function AdminCategoryForm({
  categories,
  initialCategory,
  isSubmitting = false,
  error = null,
  onSubmit,
}: AdminCategoryFormProps) {
  const isEdit = Boolean(initialCategory);

  const [name, setName] = useState(
    initialCategory?.name ?? ""
  );

  const [slug, setSlug] = useState(
    initialCategory?.slug ?? ""
  );

  const [description, setDescription] = useState(
    initialCategory?.description ?? ""
  );

  const [image, setImage] = useState(
    initialCategory?.image ?? ""
  );

  const [parentId, setParentId] = useState<string>(
    initialCategory?.parentId ?? ""
  );

  const [isActive, setIsActive] = useState(
    initialCategory?.isActive ?? true
  );

  const [sortOrder, setSortOrder] = useState(
    initialCategory?.sortOrder ?? 0
  );

  const [slugManuallyEdited, setSlugManuallyEdited] =
    useState(isEdit);

  const [validationError, setValidationError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!slugManuallyEdited) {
      setSlug(createSlug(name));
    }
  }, [name, slugManuallyEdited]);

  const currentValues: CategoryFormValues = {
    name,
    slug,
    description,
    image,
    parentId,
    isActive,
    sortOrder,
  };

  const initialValues = getInitialValues(
    initialCategory
  );

  const isDirty =
    !isEdit ||
    JSON.stringify(
      normalizeValues(currentValues)
    ) !==
      JSON.stringify(
        normalizeValues(initialValues)
      );

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

    if (!trimmedName) {
      setValidationError(
        "Category name is required."
      );
      return;
    }

    if (!trimmedSlug) {
      setValidationError(
        "Category slug is required."
      );
      return;
    }

    if (sortOrder < 0) {
      setValidationError(
        "Sort order cannot be negative."
      );
      return;
    }

    setValidationError(null);

    onSubmit({
      name: trimmedName,
      slug: trimmedSlug,
      description:
        description.trim() || undefined,
      image: image.trim() || undefined,
      parentId: parentId || null,
      isActive,
      sortOrder,
    });
  };

  const availableParents = categories.filter(
    (category) =>
      category.id !== initialCategory?.id
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5">
          {/* Name */}
          <div>
            <label
              htmlFor="category-name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category Name
            </label>

            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="e.g. T-Shirts"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:bg-gray-100"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="category-slug"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Slug
            </label>

            <input
              id="category-slug"
              type="text"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugManuallyEdited(true);
              }}
              placeholder="e.g. t-shirts"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:bg-gray-100"
            />

            <p className="mt-1.5 text-xs text-gray-500">
              Used in the category URL.
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="category-description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="category-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe this category..."
              rows={4}
              disabled={isSubmitting}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:bg-gray-100"
            />
          </div>

          {/* Image */}
          <div>
            <label
              htmlFor="category-image"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Image URL
            </label>

            <input
              id="category-image"
              type="url"
              value={image}
              onChange={(event) =>
                setImage(event.target.value)
              }
              placeholder="https://..."
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:bg-gray-100"
            />

            <p className="mt-1.5 text-xs text-gray-500">
              Cloudinary upload can be added later.
            </p>
          </div>

          {/* Parent */}
          <div>
            <label
              htmlFor="category-parent"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Parent Category
            </label>

            <select
              id="category-parent"
              value={parentId}
              onChange={(event) =>
                setParentId(event.target.value)
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:bg-gray-100"
            >
              <option value="">
                No Parent — Top Level Category
              </option>

              {availableParents.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <p className="mt-1.5 text-xs text-gray-500">
              Select a parent if this is a subcategory.
            </p>
          </div>

          {/* Sort Order */}
          <div>
            <label
              htmlFor="category-sort-order"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Sort Order
            </label>

            <input
              id="category-sort-order"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  Number(event.target.value)
                )
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:bg-gray-100"
            />

            <p className="mt-1.5 text-xs text-gray-500">
              Lower numbers appear first.
            </p>
          </div>

          {/* Active */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(event.target.checked)
              }
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-gray-300"
            />

            <span>
              <span className="block text-sm font-medium text-gray-700">
                Active Category
              </span>

              <span className="block text-xs text-gray-500">
                Active categories can be shown on the storefront.
              </span>
            </span>
          </label>
        </div>
      </div>

      {(validationError || error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {validationError || error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Updating..."
            : isEdit
              ? "Update Category"
              : "Create Category"}
        </button>
      </div>
    </form>
  );
}