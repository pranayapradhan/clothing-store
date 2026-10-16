import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import PageContainer from "../../components/shared/PageContainer";
import ProductGrid from "../../features/products/ProductGrid";
import ProductGridSkeleton from "../../features/products/ProductCardSkeleton";
import { useProducts } from "../../features/products/useProducts";
import { useDebounce } from "../../hooks/useDebounce";

const PRODUCTS_PER_PAGE = 12;

type SortOption =
  | "newest"
  | "price-low"
  | "price-high"
  | "name";

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductsPage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const category =
    searchParams.get("category") || undefined;

  const search =
    searchParams.get("search") || undefined;

  const size =
    searchParams.get("size") || undefined;

  const pageFromUrl = Number(
    searchParams.get("page") || "1"
  );

  const currentPage =
    Number.isInteger(pageFromUrl) &&
    pageFromUrl > 0
      ? pageFromUrl
      : 1;

  const [brand, setBrand] = useState(
    searchParams.get("brand") || ""
  );

  const [color, setColor] = useState(
    searchParams.get("color") || ""
  );

  const [minPrice, setMinPrice] = useState(
    searchParams.get("minPrice") || ""
  );

  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") || ""
  );

  const [sort, setSort] =
    useState<SortOption>("newest");

  const [isFilterOpen, setIsFilterOpen] =
    useState(false);

  const debouncedBrand = useDebounce(
    brand,
    400
  );

  const debouncedColor = useDebounce(
    color,
    400
  );

  const debouncedMinPrice = useDebounce(
    minPrice,
    400
  );

  const debouncedMaxPrice = useDebounce(
    maxPrice,
    400
  );

  const minPriceNumber =
    debouncedMinPrice.trim() !== ""
      ? Number(debouncedMinPrice)
      : undefined;

  const maxPriceNumber =
    debouncedMaxPrice.trim() !== ""
      ? Number(debouncedMaxPrice)
      : undefined;

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useProducts({
    category,
    search,
    brand:
      debouncedBrand.trim() || undefined,
    size,
    color:
      debouncedColor.trim() || undefined,
    minPrice:
      Number.isFinite(minPriceNumber)
        ? minPriceNumber
        : undefined,
    maxPrice:
      Number.isFinite(maxPriceNumber)
        ? maxPriceNumber
        : undefined,
    page: currentPage,
    limit: PRODUCTS_PER_PAGE,
  });

  const products = data?.products ?? [];
  const pagination = data?.pagination;

  const updateParams = (
    updates: Record<
      string,
      string | undefined
    >
  ) => {
    const params = new URLSearchParams(
      searchParams
    );

    Object.entries(updates).forEach(
      ([key, value]) => {
        if (
          value === undefined ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
    );

    setSearchParams(params);
  };

  const resetToFirstPage = () => {
    updateParams({
      page: "1",
    });
  };

  /*
   * Sync debounced filter values with URL.
   */
  useEffect(() => {
    const params = new URLSearchParams(
      searchParams
    );

    const syncFilter = (
      key: string,
      value: string
    ) => {
      if (value.trim()) {
        params.set(
          key,
          value.trim()
        );
      } else {
        params.delete(key);
      }
    };

    syncFilter(
      "brand",
      debouncedBrand
    );

    syncFilter(
      "color",
      debouncedColor
    );

    syncFilter(
      "minPrice",
      debouncedMinPrice
    );

    syncFilter(
      "maxPrice",
      debouncedMaxPrice
    );

    params.set("page", "1");

    const nextParams =
      params.toString();

    if (
      nextParams !==
      searchParams.toString()
    ) {
      setSearchParams(params, {
        replace: true,
      });
    }
  }, [
    debouncedBrand,
    debouncedColor,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);

  /*
   * Client-side sorting for the
   * currently loaded page.
   */
  const sortedProducts = useMemo(() => {
    return [...products].sort(
      (a, b) => {
        switch (sort) {
          case "price-low":
            return (
              Number(
                a.discountPrice ??
                  a.basePrice
              ) -
              Number(
                b.discountPrice ??
                  b.basePrice
              )
            );

          case "price-high":
            return (
              Number(
                b.discountPrice ??
                  b.basePrice
              ) -
              Number(
                a.discountPrice ??
                  a.basePrice
              )
            );

          case "name":
            return a.name.localeCompare(
              b.name
            );

          case "newest":
          default:
            return (
              new Date(
                b.createdAt
              ).getTime() -
              new Date(
                a.createdAt
              ).getTime()
            );
        }
      }
    );
  }, [products, sort]);

  /*
   * Active filter chips.
   */
  const activeFilters = useMemo(() => {
    return [
      brand.trim()
        ? {
            key: "brand",
            label: `Brand: ${brand.trim()}`,
          }
        : null,

      size
        ? {
            key: "size",
            label: `Size: ${size}`,
          }
        : null,

      color.trim()
        ? {
            key: "color",
            label: `Color: ${color.trim()}`,
          }
        : null,

      minPrice.trim()
        ? {
            key: "minPrice",
            label: `Min: Rs. ${minPrice}`,
          }
        : null,

      maxPrice.trim()
        ? {
            key: "maxPrice",
            label: `Max: Rs. ${maxPrice}`,
          }
        : null,
    ].filter(Boolean) as {
      key: string;
      label: string;
    }[];
  }, [
    brand,
    size,
    color,
    minPrice,
    maxPrice,
  ]);

  const filterCount =
    activeFilters.length;

  const removeFilter = (
    key: string
  ) => {
    if (key === "brand") {
      setBrand("");
    }

    if (key === "color") {
      setColor("");
    }

    if (key === "minPrice") {
      setMinPrice("");
    }

    if (key === "maxPrice") {
      setMaxPrice("");
    }

    if (key === "size") {
      updateParams({
        size: undefined,
        page: "1",
      });

      return;
    }

    resetToFirstPage();
  };

  const clearFilters = () => {
    setBrand("");
    setColor("");
    setMinPrice("");
    setMaxPrice("");

    const params = new URLSearchParams();

    if (category) {
      params.set(
        "category",
        category
      );
    }

    if (search) {
      params.set(
        "search",
        search
      );
    }

    params.set("page", "1");

    setSearchParams(params);
  };

  const handleSizeChange = (
    selectedSize: string
  ) => {
    updateParams({
      size:
        size === selectedSize
          ? undefined
          : selectedSize,
      page: "1",
    });
  };

  const handlePageChange = (
    page: number
  ) => {
    if (!pagination) {
      return;
    }

    if (
      page < 1 ||
      page > pagination.totalPages
    ) {
      return;
    }

    updateParams({
      page: String(page),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * Generate pagination buttons.
   */
  const pageNumbers = useMemo(() => {
    if (!pagination) {
      return [];
    }

    const totalPages =
      pagination.totalPages;

    const current =
      pagination.page;

    if (totalPages <= 7) {
      return Array.from(
        {
          length: totalPages,
        },
        (_, index) => index + 1
      );
    }

    const pages: (
      | number
      | "ellipsis-left"
      | "ellipsis-right"
    )[] = [];

    pages.push(1);

    if (current > 4) {
      pages.push(
        "ellipsis-left"
      );
    }

    const start = Math.max(
      2,
      current - 1
    );

    const end = Math.min(
      totalPages - 1,
      current + 1
    );

    for (
      let page = start;
      page <= end;
      page++
    ) {
      pages.push(page);
    }

    if (
      current <
      totalPages - 3
    ) {
      pages.push(
        "ellipsis-right"
      );
    }

    pages.push(totalPages);

    return pages;
  }, [pagination]);

  return (
    <main className="min-h-screen bg-white">
      <PageContainer className="py-8 sm:py-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm text-gray-500">
              {category
                ? `Category: ${category}`
                : "All clothing"}
            </p>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Shop
            </h1>

            {search && (
              <p className="mt-2 text-sm text-gray-600">
                Search results for{" "}
                <span className="font-medium">
                  "{search}"
                </span>
              </p>
            )}
          </div>

          {/* Desktop Sort */}
          <div className="hidden items-center gap-3 md:flex">
            {pagination && (
              <span className="text-sm text-gray-500">
                {pagination.total}{" "}
                products
              </span>
            )}

            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target
                    .value as SortOption
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400"
            >
              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="name">
                Name
              </option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length >
          0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeFilters.map(
              (filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() =>
                    removeFilter(
                      filter.key
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  {filter.label}

                  <X className="h-3.5 w-3.5" />
                </button>
              )
            )}

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="px-2 py-1 text-xs font-medium text-gray-500 underline underline-offset-2 hover:text-black"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden w-60 shrink-0 md:block">
            <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-semibold">
                  Filters
                </h2>

                {filterCount > 0 && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="text-xs text-gray-500 underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Brand */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium">
                  Brand
                </label>

                <input
                  type="text"
                  value={brand}
                  onChange={(event) => {
                    setBrand(
                      event.target
                        .value
                    );
                    resetToFirstPage();
                  }}
                  placeholder="Search brand"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>

              {/* Size */}
              <div className="mb-6">
                <p className="mb-2 text-sm font-medium">
                  Size
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {sizes.map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          handleSizeChange(
                            item
                          )
                        }
                        className={`rounded-md border px-2 py-2 text-xs font-medium transition ${
                          size === item
                            ? "border-black bg-black text-white"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Color */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium">
                  Color
                </label>

                <input
                  type="text"
                  value={color}
                  onChange={(event) => {
                    setColor(
                      event.target
                        .value
                    );
                    resetToFirstPage();
                  }}
                  placeholder="e.g. Black"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>

              {/* Price */}
              <div>
                <p className="mb-2 text-sm font-medium">
                  Price
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) => {
                      setMinPrice(
                        event.target
                          .value
                      );
                      resetToFirstPage();
                    }}
                    placeholder="Min"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />

                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) => {
                      setMaxPrice(
                        event.target
                          .value
                      );
                      resetToFirstPage();
                    }}
                    placeholder="Max"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Product Section */}
          <section className="min-w-0 flex-1">
            {/* Mobile Controls */}
            <div className="mb-5 flex items-center justify-between gap-3 md:hidden">
              <button
                type="button"
                onClick={() =>
                  setIsFilterOpen(
                    true
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium"
              >
                <SlidersHorizontal className="h-4 w-4" />

                Filters

                {filterCount >
                  0 && (
                  <span className="rounded-full bg-black px-1.5 py-0.5 text-[10px] text-white">
                    {filterCount}
                  </span>
                )}
              </button>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target
                      .value as SortOption
                  )
                }
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none"
              >
                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="name">
                  Name
                </option>
              </select>
            </div>

            {/* Fetching */}
            {isFetching &&
              !isLoading && (
                <div className="mb-4 text-xs text-gray-500">
                  Updating products...
                </div>
              )}

            {/* Loading */}
            {isLoading ? (
              <ProductGridSkeleton />
            ) : isError ? (
              <div className="rounded-xl border border-red-100 bg-red-50 p-8 text-center">
                <h2 className="mb-2 font-semibold text-red-700">
                  Failed to load
                  products
                </h2>

                <p className="text-sm text-red-600">
                  {error instanceof
                  Error
                    ? error.message
                    : "Something went wrong. Please try again."}
                </p>
              </div>
            ) : products.length ===
              0 ? (
              <div className="rounded-xl border border-gray-200 p-10 text-center">
                <h2 className="mb-2 text-lg font-semibold">
                  No products
                  found
                </h2>

                <p className="mb-5 text-sm text-gray-500">
                  Try changing your
                  search or filters.
                </p>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={
                    sortedProducts
                  }
                />

                {/* Pagination */}
                {pagination &&
                  pagination.totalPages >
                    1 && (
                    <div className="mt-10 flex flex-col items-center gap-4">
                      <p className="text-sm text-gray-500">
                        Showing page{" "}
                        <span className="font-medium text-gray-700">
                          {
                            pagination.page
                          }
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-gray-700">
                          {
                            pagination.totalPages
                          }
                        </span>
                      </p>

                      <div className="flex items-center gap-1">
                        {/* Previous */}
                        <button
                          type="button"
                          disabled={
                            !pagination.hasPreviousPage
                          }
                          onClick={() =>
                            handlePageChange(
                              pagination.page -
                                1
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        {/* Page Numbers */}
                        {pageNumbers.map(
                          (page) => {
                            if (
                              page ===
                              "ellipsis-left"
                            ) {
                              return (
                                <span
                                  key={
                                    page
                                  }
                                  className="flex h-9 w-9 items-center justify-center text-sm text-gray-400"
                                >
                                  ...
                                </span>
                              );
                            }

                            if (
                              page ===
                              "ellipsis-right"
                            ) {
                              return (
                                <span
                                  key={
                                    page
                                  }
                                  className="flex h-9 w-9 items-center justify-center text-sm text-gray-400"
                                >
                                  ...
                                </span>
                              );
                            }

                            const isActive =
                              page ===
                              pagination.page;

                            return (
                              <button
                                key={
                                  page
                                }
                                type="button"
                                onClick={() =>
                                  handlePageChange(
                                    page
                                  )
                                }
                                className={`h-9 min-w-9 rounded-md px-2 text-sm transition ${
                                  isActive
                                    ? "bg-black text-white"
                                    : "border border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          }
                        )}

                        {/* Next */}
                        <button
                          type="button"
                          disabled={
                            !pagination.hasNextPage
                          }
                          onClick={() =>
                            handlePageChange(
                              pagination.page +
                                1
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Next page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
              </>
            )}
          </section>
        </div>
      </PageContainer>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() =>
              setIsFilterOpen(
                false
              )
            }
            className="absolute inset-0 bg-black/40"
          />

          {/* Drawer */}
          <aside className="absolute right-0 top-0 h-full w-[min(90%,380px)] overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold">
                Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setIsFilterOpen(
                    false
                  )
                }
                className="rounded-md p-2 hover:bg-gray-100"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-7 p-5">
              {/* Brand */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Brand
                </label>

                <input
                  type="text"
                  value={brand}
                  onChange={(event) => {
                    setBrand(
                      event.target
                        .value
                    );
                    resetToFirstPage();
                  }}
                  placeholder="Search brand"
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-gray-400"
                />
              </div>

              {/* Size */}
              <div>
                <p className="mb-3 text-sm font-medium">
                  Size
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {sizes.map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          handleSizeChange(
                            item
                          )
                        }
                        className={`rounded-md border px-3 py-3 text-sm font-medium ${
                          size === item
                            ? "border-black bg-black text-white"
                            : "border-gray-200"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Color
                </label>

                <input
                  type="text"
                  value={color}
                  onChange={(event) => {
                    setColor(
                      event.target
                        .value
                    );
                    resetToFirstPage();
                  }}
                  placeholder="e.g. Black"
                  className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-gray-400"
                />
              </div>

              {/* Price */}
              <div>
                <p className="mb-3 text-sm font-medium">
                  Price
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) => {
                      setMinPrice(
                        event.target
                          .value
                      );
                      resetToFirstPage();
                    }}
                    placeholder="Min price"
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-gray-400"
                  />

                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) => {
                      setMaxPrice(
                        event.target
                          .value
                      );
                      resetToFirstPage();
                    }}
                    placeholder="Max price"
                    className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="sticky bottom-0 border-t bg-white p-5">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium"
                >
                  Clear all
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsFilterOpen(
                      false
                    )
                  }
                  className="flex-1 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white"
                >
                  View products
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

