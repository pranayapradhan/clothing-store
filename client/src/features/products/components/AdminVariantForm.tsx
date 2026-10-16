import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  useCreateAdminVariant,
  useUpdateAdminVariant,
} from "../useAdminProducts";

interface AdminVariantFormProps {
  productId: string;
  variant?: {
    id: string;
    color: string;
    colorCode: string;
    size: string;
    sku: string;
    price: string;
    isActive: boolean;
  };
  onSuccess: () => void;
  onCancel?: () => void;
}

const AdminVariantForm = ({
  productId,
  variant,
  onSuccess,
  onCancel,
}: AdminVariantFormProps) => {
  const isEditMode = Boolean(variant);

  const createVariant = useCreateAdminVariant();
  const updateVariant = useUpdateAdminVariant();

  const [color, setColor] = useState("");
  const [colorCode, setColorCode] = useState("");
  const [size, setSize] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!variant) {
      setColor("");
      setColorCode("");
      setSize("");
      setSku("");
      setPrice("");
      setIsActive(true);
      return;
    }

    setColor(variant.color || "");
    setColorCode(variant.colorCode || "");
    setSize(variant.size || "");
    setSku(variant.sku || "");
    setPrice(variant.price || "");
    setIsActive(variant.isActive);
  }, [variant]);

  const isSubmitting =
    createVariant.isPending || updateVariant.isPending;

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    const trimmedSku = sku.trim();
    const priceNumber = Number(price);

    if (!trimmedSku) {
      setError("SKU is required.");
      return;
    }

    if (!price.trim() || !Number.isFinite(priceNumber)) {
      setError("Valid price is required.");
      return;
    }

    if (priceNumber < 0) {
      setError("Price cannot be negative.");
      return;
    }

    try {
      if (isEditMode && variant) {
        await updateVariant.mutateAsync({
          variantId: variant.id,
          payload: {
            color: color.trim() || undefined,
            colorCode: colorCode.trim() || undefined,
            size: size.trim() || undefined,
            sku: trimmedSku,
            price: priceNumber,
            isActive,
          },
        });
      } else {
        await createVariant.mutateAsync({
          productId,
          color: color.trim() || undefined,
          colorCode: colorCode.trim() || undefined,
          size: size.trim() || undefined,
          sku: trimmedSku,
          price: priceNumber,
          isActive,
        });
      }

      onSuccess();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to save variant."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Color
          </label>

          <input
            type="text"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            placeholder="Black"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Color Code
          </label>

          <input
            type="text"
            value={colorCode}
            onChange={(event) =>
              setColorCode(event.target.value)
            }
            placeholder="#000000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Size
          </label>

          <input
            type="text"
            value={size}
            onChange={(event) => setSize(event.target.value)}
            placeholder="M"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            SKU <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            placeholder="TSH-BLK-M-001"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Price <span className="text-red-500">*</span>
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="1999"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
          />
        </div>

        <div className="flex items-center gap-3 sm:pt-7">
          <input
            id="variant-active"
            type="checkbox"
            checked={isActive}
            onChange={(event) =>
              setIsActive(event.target.checked)
            }
            className="h-4 w-4 rounded border-gray-300"
          />

          <label
            htmlFor="variant-active"
            className="text-sm font-medium text-gray-700"
          >
            Active variant
          </label>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {isEditMode ? "Update Variant" : "Add Variant"}
        </button>
      </div>
    </form>
  );
};

export default AdminVariantForm;