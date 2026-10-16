import { Link } from "react-router-dom";

import type { Category } from "./category.service";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({
  category,
}: CategoryCardProps) {
  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            {category.name}
          </div>
        )}
      </div>

      <div className="p-5">
        <h2 className="text-lg font-semibold text-gray-900">
          {category.name}
        </h2>

        {category.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">
            {category.description}
          </p>
        )}

        <span className="mt-4 inline-block text-sm font-medium text-gray-900">
          Shop now →
        </span>
      </div>
    </Link>
  );
}