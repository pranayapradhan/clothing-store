import { useState } from "react";
import { ArrowLeft, Minus, Package, Plus, Save } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  useInventory,
  useAdjustInventory,
  useSetInventory,
  useInitializeInventory,
} from "../../../features/inventory/useInventory";

export default function AdminInventoryManagePage() {
  const { variantId } = useParams<{ variantId: string }>();

  const { data: inventory, isLoading, isError } = useInventory(variantId || "");

  const adjustMutation = useAdjustInventory();
  const setMutation = useSetInventory();
  const initializeMutation = useInitializeInventory();

  const [quantity, setQuantity] = useState("");
  const [threshold, setThreshold] = useState("");
  const [initialQuantity, setInitialQuantity] = useState("");
  const [initialThreshold, setInitialThreshold] = useState("5");

  if (!variantId) {
    return (
      <div className="p-6">
        <p className="text-red-600">Invalid variant ID.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-32 rounded-xl bg-gray-200" />
          <div className="h-48 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4 p-6">
        <Link
          to="/admin/inventory"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Inventory
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load inventory information.
        </div>
      </div>
    );
  }

  if (!inventory) {
    const handleInitialize = () => {
      const quantity = Number(initialQuantity);
      const threshold = Number(initialThreshold);

      if (
        !Number.isInteger(quantity) ||
        quantity < 0 ||
        !Number.isInteger(threshold) ||
        threshold < 0
      ) {
        return;
      }

      initializeMutation.mutate({
        variantId,
        payload: {
          quantity,
          lowStockThreshold: threshold,
        },
      });
    };

    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div>
          <Link
            to="/admin/inventory"
            className="mb-3 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Inventory
          </Link>

          <h1 className="text-2xl font-semibold text-gray-900">
            Initialize Inventory
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create the initial inventory record for this product variant.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Initial Stock</h2>

          <p className="mt-1 text-sm text-gray-500">
            Set the starting stock quantity and low-stock threshold.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Initial Quantity
              </label>

              <input
                type="number"
                min="0"
                value={initialQuantity}
                onChange={(event) => setInitialQuantity(event.target.value)}
                placeholder="Enter quantity"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Low Stock Threshold
              </label>

              <input
                type="number"
                min="0"
                value={initialThreshold}
                onChange={(event) => setInitialThreshold(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleInitialize}
            disabled={initializeMutation.isPending || initialQuantity === ""}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Package size={16} />

            {initializeMutation.isPending
              ? "Initializing..."
              : "Initialize Inventory"}
          </button>

          {initializeMutation.isError && (
            <p className="mt-3 text-sm text-red-600">
              Failed to initialize inventory. Please try again.
            </p>
          )}
        </div>
      </div>
    );
  }

  const variant = inventory.variant;

  const available = inventory.quantity - inventory.reservedQuantity;

  const handleSetStock = () => {
    const newQuantity = Number(quantity);

    if (!Number.isInteger(newQuantity) || newQuantity < 0) {
      return;
    }

    const newThreshold =
      threshold === "" ? inventory.lowStockThreshold : Number(threshold);

    if (!Number.isInteger(newThreshold) || newThreshold < 0) {
      return;
    }

    setMutation.mutate({
      variantId,
      payload: {
        quantity: newQuantity,
        lowStockThreshold: newThreshold,
      },
    });
  };

  const handleAdjust = (amount: number) => {
    adjustMutation.mutate({
      variantId,
      payload: {
        quantity: amount,
      },
    });
  };

  const isSaving = setMutation.isPending || adjustMutation.isPending;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <Link
          to="/admin/inventory"
          className="mb-3 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Inventory
        </Link>

        <h1 className="text-2xl font-semibold text-gray-900">
          Manage Inventory
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage stock levels for this product variant.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Product Variant
            </h2>

            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Color:</span>{" "}
                {variant?.color || "—"}
              </p>

              <p>
                <span className="font-medium">Size:</span>{" "}
                {variant?.size || "—"}
              </p>

              <p>
                <span className="font-medium">SKU:</span> {variant?.sku || "—"}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 px-5 py-4 text-center">
            <p className="text-sm text-gray-500">Available Stock</p>

            <p className="mt-1 text-3xl font-bold text-gray-900">{available}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Physical Stock</p>
          <p className="mt-2 text-2xl font-semibold">{inventory.quantity}</p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Reserved</p>
          <p className="mt-2 text-2xl font-semibold">
            {inventory.reservedQuantity}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Low Stock Threshold</p>
          <p className="mt-2 text-2xl font-semibold">
            {inventory.lowStockThreshold}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Quick Stock Adjustment
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Increase or decrease the current physical stock.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleAdjust(-1)}
            disabled={isSaving || inventory.quantity <= 0}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus size={16} />
            Remove 1
          </button>

          <button
            type="button"
            onClick={() => handleAdjust(1)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            Add 1
          </button>

          <button
            type="button"
            onClick={() => handleAdjust(5)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            Add 5
          </button>

          <button
            type="button"
            onClick={() => handleAdjust(10)}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            Add 10
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Set Inventory</h2>

        <p className="mt-1 text-sm text-gray-500">
          Set an exact physical stock quantity and low-stock threshold.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Stock Quantity
            </label>

            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder={String(inventory.quantity)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Low Stock Threshold
            </label>

            <input
              type="number"
              min="0"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              placeholder={String(inventory.lowStockThreshold)}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSetStock}
          disabled={isSaving || quantity === ""}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={16} />
          {setMutation.isPending ? "Saving..." : "Save Inventory"}
        </button>

        {setMutation.isError && (
          <p className="mt-3 text-sm text-red-600">
            Failed to update inventory.
          </p>
        )}

        {adjustMutation.isError && (
          <p className="mt-3 text-sm text-red-600">Failed to adjust stock.</p>
        )}
      </div>
    </div>
  );
}
