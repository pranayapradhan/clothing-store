import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import AdminInventoryTable from "../../../features/inventory/components/AdminInventoryTable";
import { useAdminProducts } from "../../../features/products/useAdminProducts";
import { useInventory } from "../../../features/inventory/useInventory";

interface InventoryRow {
  inventory: Awaited<
    ReturnType<
      typeof import("../../../features/inventory/inventory.service").getInventory
    >
  > | null;
  variant: {
    id: string;
    color: string;
    size: string;
    sku: string;
    price: string;
    isActive: boolean;
  };
  product: {
    id: string;
    name: string;
  };
}

const InventoryVariantRow = ({
  variant,
  onLoaded,
}: {
  // product: {
  //   id: string;
  //   name: string;
  // };
  variant: {
    id: string;
    color: string;
    size: string;
    sku: string;
    price: string;
    isActive: boolean;
  };
  onLoaded: (
    variantId: string,
    inventory: InventoryRow["inventory"]
  ) => void;
}) => {
  const { data, isLoading, isError } =
    useInventory(variant.id);

  useEffect(() => {
    if (!isLoading) {
      onLoaded(
        variant.id,
        isError ? null : data ?? null
      );
    }
  }, [
    data,
    isError,
    isLoading,
    onLoaded,
    variant.id,
  ]);

  return null;
};

const AdminInventoryPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [inventoryMap, setInventoryMap] =
    useState<Record<string, InventoryRow["inventory"]>>(
      {}
    );

  const {
    data,
    isLoading,
    isError,
  } = useAdminProducts({
    search,
    status: "all",
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const products = data?.data.products ?? [];

  const handleInventoryLoaded = (
    variantId: string,
    inventory: InventoryRow["inventory"]
  ) => {
    setInventoryMap((previous) => {
      if (previous[variantId] === inventory) {
        return previous;
      }

      return {
        ...previous,
        [variantId]: inventory,
      };
    });
  };

  const rows = useMemo<InventoryRow[]>(() => {
    return products.flatMap((product) =>
      (product.variants ?? []).map((variant) => ({
        product: {
          id: product.id,
          name: product.name,
        },
        variant: {
          id: variant.id,
          color: variant.color,
          size: variant.size,
          sku: variant.sku,
          price: variant.price,
          isActive: variant.isActive,
        },
        inventory:
          inventoryMap[variant.id] ?? null,
      }))
    );
  }, [products, inventoryMap]);

  const visibleRows = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((row) => {
      return (
        row.product.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        row.variant.sku
          .toLowerCase()
          .includes(normalizedSearch) ||
        row.variant.color
          .toLowerCase()
          .includes(normalizedSearch) ||
        row.variant.size
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [rows, search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Inventory
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Monitor stock levels across all product variants.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <input
            type="search"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
            placeholder="Search product, SKU, color, or size..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gray-900"
          />
        </div>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load inventory products.
        </div>
      )}

      <AdminInventoryTable
        rows={visibleRows}
        isLoading={isLoading}
      />

      {products.flatMap(
        (product) => product.variants ?? []
      ).map((variant) => {
        const product = products.find(
          (item) => item.id === variant.productId
        );

        if (!product) {
          return null;
        }

        return (
          <InventoryVariantRow
            key={variant.id}
            // product={{
            //   id: product.id,
            //   name: product.name,
            // }}
            variant={{
              id: variant.id,
              color: variant.color,
              size: variant.size,
              sku: variant.sku,
              price: variant.price,
              isActive: variant.isActive,
            }}
            onLoaded={handleInventoryLoaded}
          />
        );
      })}
    </div>
  );
};

export default AdminInventoryPage;