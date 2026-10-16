import { Link } from "react-router-dom";

import CategoryCard from "../../features/categories/CategoryCard";
import { useCategories } from "../../features/categories/useCategories";

export default function CategoriesPage() {
  const {
    data: categories,
    isLoading,
    isError,
  } = useCategories();

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="h-10 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-5 w-80 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-2xl border border-gray-200"
            >
              <div className="aspect-[4/3] bg-gray-200" />

              <div className="space-y-3 p-5">
                <div className="h-5 w-32 rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-20 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Unable to load categories
          </h1>

          <p className="mt-2 text-gray-500">
            Something went wrong while loading categories.
          </p>
        </div>
      </main>
    );
  }

  const activeCategories =
    categories?.filter((category) => category.isActive) ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <Link
          to="/products"
          className="text-sm text-gray-500 transition hover:text-black"
        >
          ← Back to Shop
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Categories
        </h1>

        <p className="mt-3 max-w-2xl text-gray-500">
          Explore our collection by category and find the
          perfect style for you.
        </p>
      </div>

      {/* Empty State */}
      {activeCategories.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-gray-300">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No categories available
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Check back later for new collections.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeCategories
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
              />
            ))}
        </div>
      )}
    </main>
  );
}