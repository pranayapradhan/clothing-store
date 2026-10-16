import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";

import type { Product } from "../../../types/product";
import {
  useCreateAdminProduct,
  useUpdateAdminProduct,
} from "../useAdminProducts";

interface AdminProductFormProps {
  product?: Product;
  categories: {
    id: string;
    name: string;
  }[];
  isLoadingCategories?: boolean;
  onSuccess: () => void;
}

interface ExistingGalleryImage {
  url: string;
  publicId: string;
}

interface NewGalleryImage {
  id: string;
  file: File;
  preview: string;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_GALLERY_IMAGES = 9;

const AdminProductForm = ({
  product,
  categories,
  isLoadingCategories = false,
  onSuccess,
}: AdminProductFormProps) => {
  const isEditMode = Boolean(product);

  const createMutation = useCreateAdminProduct();
  const updateMutation = useUpdateAdminProduct();

  const mainImageInputRef =
    useRef<HTMLInputElement>(null);

  const galleryInputRef =
    useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [mainImageFile, setMainImageFile] =
    useState<File | null>(null);

  const [mainImagePreview, setMainImagePreview] =
    useState<string | null>(null);

  const [existingGalleryImages, setExistingGalleryImages] =
    useState<ExistingGalleryImage[]>([]);

  const [removedImagePublicIds, setRemovedImagePublicIds] =
    useState<string[]>([]);

  const [newGalleryImages, setNewGalleryImages] =
    useState<NewGalleryImage[]>([]);

  const [removeMainImage, setRemoveMainImage] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!product) {
      setName("");
      setSlug("");
      setBrand("");
      setCategoryId("");
      setDescription("");
      setBasePrice("");
      setDiscountPrice("");
      setIsActive(true);

      setMainImageFile(null);
      setMainImagePreview(null);

      setExistingGalleryImages([]);
      setRemovedImagePublicIds([]);
      setNewGalleryImages([]);
      setRemoveMainImage(false);

      return;
    }

    setName(product.name);
    setSlug(product.slug);
    setBrand(product.brand ?? "");
    setCategoryId(product.categoryId);
    setDescription(product.description ?? "");
    setBasePrice(product.basePrice);
    setDiscountPrice(product.discountPrice ?? "");
    setIsActive(product.isActive);

    setMainImageFile(null);
    setMainImagePreview(product.mainImage ?? null);

    const images = product.images ?? [];
    const publicIds = product.imagePublicIds ?? [];

    const galleryImages: ExistingGalleryImage[] =
      images
        .map((url, index) => ({
          url,
          publicId: publicIds[index] ?? "",
        }))
        .filter((image) => image.publicId);

    setExistingGalleryImages(galleryImages);

    setRemovedImagePublicIds([]);
    setNewGalleryImages([]);
    setRemoveMainImage(false);
    setError(null);
  }, [product]);

  useEffect(() => {
    return () => {
      newGalleryImages.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [newGalleryImages]);

  const generateSlug = () => {
    const generatedSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setSlug(generatedSlug);
  };

  const handleMainImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(
        "Main image must be JPG, JPEG, PNG, or WebP.",
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(
        "Main image must be smaller than 5MB.",
      );
      event.target.value = "";
      return;
    }

    if (mainImagePreview && mainImageFile) {
      URL.revokeObjectURL(mainImagePreview);
    }

    const preview = URL.createObjectURL(file);

    setMainImageFile(file);
    setMainImagePreview(preview);
    setRemoveMainImage(false);
    setError(null);

    event.target.value = "";
  };

  const handleRemoveMainImage = () => {
    if (mainImageFile && mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }

    setMainImageFile(null);
    setMainImagePreview(null);

    if (product?.mainImage) {
      setRemoveMainImage(true);
    }

    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = "";
    }

    setError(null);
  };

  const handleGalleryImagesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(
      event.target.files ?? [],
    );

    if (!files.length) {
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError(
          `Image "${file.name}" must be JPG, JPEG, PNG, or WebP.`,
        );
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setError(
          `Image "${file.name}" is larger than 5MB.`,
        );
        continue;
      }

      validFiles.push(file);
    }

    const currentGalleryCount =
      existingGalleryImages.length +
      newGalleryImages.length;

    const remainingSlots =
      MAX_GALLERY_IMAGES - currentGalleryCount;

    if (remainingSlots <= 0) {
      setError(
        "You already have the maximum of 9 gallery images.",
      );
      event.target.value = "";
      return;
    }

    const filesToAdd = validFiles.slice(
      0,
      remainingSlots,
    );

    const newImages = filesToAdd.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewGalleryImages((current) => [
      ...current,
      ...newImages,
    ]);

    if (validFiles.length > remainingSlots) {
      setError(
        `Only ${remainingSlots} more gallery image${
          remainingSlots === 1 ? "" : "s"
        } can be added.`,
      );
    } else if (filesToAdd.length > 0) {
      setError(null);
    }

    event.target.value = "";
  };

  const handleRemoveExistingImage = (
    publicId: string,
  ) => {
    setExistingGalleryImages((current) =>
      current.filter(
        (image) => image.publicId !== publicId,
      ),
    );

    setRemovedImagePublicIds((current) =>
      current.includes(publicId)
        ? current
        : [...current, publicId],
    );

    setError(null);
  };

  const handleRemoveNewGalleryImage = (
    id: string,
  ) => {
    setNewGalleryImages((current) => {
      const image = current.find(
        (item) => item.id === id,
      );

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      return current.filter(
        (item) => item.id !== id,
      );
    });

    setError(null);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setError(null);

      if (!name.trim()) {
        setError("Product name is required.");
        return;
      }

      if (!slug.trim()) {
        setError("Product slug is required.");
        return;
      }

      if (!categoryId) {
        setError("Please select a category.");
        return;
      }

      if (!basePrice) {
        setError("Base price is required.");
        return;
      }

      const basePriceNumber = Number(basePrice);

      if (
        !Number.isFinite(basePriceNumber) ||
        basePriceNumber < 0
      ) {
        setError(
          "Base price must be a valid non-negative number.",
        );
        return;
      }

      const discountPriceNumber =
        discountPrice.trim()
          ? Number(discountPrice)
          : null;

      if (
        discountPriceNumber !== null &&
        (!Number.isFinite(discountPriceNumber) ||
          discountPriceNumber < 0)
      ) {
        setError(
          "Discount price must be a valid non-negative number.",
        );
        return;
      }

      if (
        discountPriceNumber !== null &&
        discountPriceNumber > basePriceNumber
      ) {
        setError(
          "Discount price cannot be greater than base price.",
        );
        return;
      }

      if (!isEditMode && !mainImageFile) {
        setError(
          "Main product image is required.",
        );
        return;
      }

      const commonPayload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description:
          description.trim() || undefined,
        brand: brand.trim() || undefined,
        categoryId,
        basePrice: basePriceNumber,
        discountPrice: discountPriceNumber,
        isActive,
      };

      if (isEditMode && product) {
        await updateMutation.mutateAsync({
          productId: product.id,
          payload: {
            ...commonPayload,

            mainImage:
              mainImageFile ?? undefined,

            images: newGalleryImages.map(
              (image) => image.file,
            ),

            removeMainImage,

            removeImagePublicIds:
              removedImagePublicIds,

            imagePublicIds:
              existingGalleryImages.map(
                (image) => image.publicId,
              ),
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...commonPayload,

          mainImage:
            mainImageFile ?? undefined,

          images: newGalleryImages.map(
            (image) => image.file,
          ),
        });
      }

      onSuccess();
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : isEditMode
            ? "Failed to update product."
            : "Failed to create product.",
      );
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending;

  const galleryCount =
    existingGalleryImages.length +
    newGalleryImages.length;

  const remainingGallerySlots =
    MAX_GALLERY_IMAGES - galleryCount;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Basic Information */}
      <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Basic Information
        </h3>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Product Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="e.g. Classic Black T-Shirt"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Slug
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(event.target.value)
                }
                placeholder="classic-black-t-shirt"
                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />

              <button
                type="button"
                onClick={generateSlug}
                className="rounded-lg border px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Generate
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Brand
            </label>

            <input
              type="text"
              value={brand}
              onChange={(event) =>
                setBrand(event.target.value)
              }
              placeholder="e.g. Nike"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              disabled={isLoadingCategories}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            >
              <option value="">
                {isLoadingCategories
                  ? "Loading categories..."
                  : "Select category"}
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={5}
              placeholder="Describe the product..."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Pricing
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Base Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={basePrice}
              onChange={(event) =>
                setBasePrice(event.target.value)
              }
              placeholder="2500"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Discount Price
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={discountPrice}
              onChange={(event) =>
                setDiscountPrice(event.target.value)
              }
              placeholder="1999"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Product Images
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              JPG, PNG, or WebP. Maximum 5MB per image.
            </p>
          </div>

          {isEditMode && (
            <div className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
              Gallery: {galleryCount}/{MAX_GALLERY_IMAGES}
            </div>
          )}
        </div>

        <div className="mt-6 space-y-7">
          {/* Main Image */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-700">
                Main Image
                {!isEditMode && (
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                )}
              </label>

              {mainImageFile && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  New image selected
                </span>
              )}
            </div>

            <input
              ref={mainImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleMainImageChange}
              className="hidden"
            />

            {mainImagePreview ? (
              <div className="group relative w-full max-w-sm overflow-hidden rounded-xl border bg-gray-50">
                <img
                  src={mainImagePreview}
                  alt="Main product"
                  className="aspect-square w-full object-cover"
                />

                {mainImageFile && (
                  <div className="absolute left-3 top-3 rounded-md bg-green-600 px-2.5 py-1 text-xs font-medium text-white">
                    New
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
                  <button
                    type="button"
                    onClick={() =>
                      mainImageInputRef.current?.click()
                    }
                    className="rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-gray-900 hover:bg-white"
                  >
                    Replace
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveMainImage}
                    className="inline-flex items-center gap-1 rounded-lg bg-black/75 px-3 py-2 text-xs font-medium text-white hover:bg-black"
                  >
                    <X className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  mainImageInputRef.current?.click()
                }
                className="flex w-full max-w-sm flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-12 text-center transition hover:border-gray-500 hover:bg-gray-50"
              >
                <ImagePlus className="h-8 w-8 text-gray-400" />

                <span className="mt-3 text-sm font-medium text-gray-700">
                  Upload Main Image
                </span>

                <span className="mt-1 text-xs text-gray-500">
                  JPG, PNG or WebP • Max 5MB
                </span>
              </button>
            )}

            {isEditMode &&
              !mainImagePreview &&
              removeMainImage && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  Main image will be removed when
                  you save the product.
                </div>
              )}
          </div>

          {/* Existing Gallery */}
          {isEditMode && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Current Gallery Images
                </label>

                {existingGalleryImages.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {existingGalleryImages.length} image
                    {existingGalleryImages.length === 1
                      ? ""
                      : "s"}
                  </span>
                )}
              </div>

              {existingGalleryImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {existingGalleryImages.map(
                    (image, index) => (
                      <div
                        key={image.publicId}
                        className="group relative overflow-hidden rounded-xl border bg-gray-50"
                      >
                        <img
                          src={image.url}
                          alt={`Product gallery ${index + 1}`}
                          className="aspect-square w-full object-cover"
                        />

                        <div className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[11px] font-medium text-white">
                          Current
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveExistingImage(
                              image.publicId,
                            )
                          }
                          className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-black/75 px-2 py-1.5 text-xs font-medium text-white opacity-100 transition hover:bg-black sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center">
                  <ImagePlus className="mx-auto h-7 w-7 text-gray-400" />

                  <p className="mt-2 text-sm font-medium text-gray-600">
                    No gallery images
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Add images below.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Add Gallery */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-700">
                Add Gallery Images
              </label>

              <span className="text-xs text-gray-500">
                {remainingGallerySlots} slot
                {remainingGallerySlots === 1
                  ? ""
                  : "s"} remaining
              </span>
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleGalleryImagesChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                galleryInputRef.current?.click()
              }
              disabled={
                galleryCount >=
                MAX_GALLERY_IMAGES
              }
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" />
              Select Images
            </button>

            <p className="mt-2 text-xs text-gray-500">
              You can add up to 9 gallery images total.
            </p>
          </div>

          {/* New Gallery Previews */}
          {newGalleryImages.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  New Gallery Images
                </label>

                <span className="text-xs font-medium text-green-600">
                  {newGalleryImages.length} new
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {newGalleryImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-xl border border-green-200 bg-gray-50"
                  >
                    <img
                      src={image.preview}
                      alt={image.file.name}
                      className="aspect-square w-full object-cover"
                    />

                    <div className="absolute left-2 top-2 rounded-md bg-green-600 px-2 py-1 text-[11px] font-medium text-white">
                      New
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveNewGalleryImage(
                          image.id,
                        )
                      }
                      className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-black/75 px-2 py-1.5 text-xs font-medium text-white opacity-100 transition hover:bg-black sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="rounded-xl border bg-white p-4 shadow-sm sm:p-6">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900">
              Product Status
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Inactive products won't appear in the
              customer storefront.
            </p>
          </div>

          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) =>
              setIsActive(event.target.checked)
            }
            className="h-5 w-5 accent-black"
          />
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onSuccess}
          disabled={isSubmitting}
          className="rounded-lg border px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            isSubmitting ||
            isLoadingCategories
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Product"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
};

export default AdminProductForm;