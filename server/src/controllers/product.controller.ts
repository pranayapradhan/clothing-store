import type { RequestHandler } from "express";

import {
  activateProduct,
  createProduct,
  createProductVariant,
  deactivateProduct,
  deactivateProductVariant,
  getProductById,
  getProductBySlug,
  getProductVariantById,
  getProducts,
  updateProduct,
  updateProductVariant,
  getAdminProducts as fetchAdminProducts,
  getAdminProductById,
} from "../services/product.service.js";

import {
  uploadProductImage,
  uploadProductImages,
  deleteProductImage,
  deleteProductImages,
} from "../services/product-image.service.js";

type ProductUploadFiles = {
  mainImage?: Express.Multer.File[];
  images?: Express.Multer.File[];
};

const getUploadedFiles = (req: Parameters<RequestHandler>[0]) => {
  return req.files as ProductUploadFiles | undefined;
};

const getStringParam = (value: string | string[] | undefined): string => {
  if (typeof value !== "string") {
    throw new Error("Invalid route parameter");
  }

  return value;
};

// ==================== PRODUCTS ====================

export const create: RequestHandler = async (req, res) => {
  const uploadedPublicIds: string[] = [];

  try {
    const files = getUploadedFiles(req);

    const mainImageFile = files?.mainImage?.[0];
    const galleryFiles = files?.images ?? [];

    if (!mainImageFile) {
      res.status(400).json({
        success: false,
        message: "Main product image is required",
      });
      return;
    }

    // Upload main image to Cloudinary
    const uploadedMainImage = await uploadProductImage(mainImageFile.buffer);

    uploadedPublicIds.push(uploadedMainImage.publicId);

    // Upload additional images to Cloudinary
    const uploadedGalleryImages =
      galleryFiles.length > 0 ? await uploadProductImages(galleryFiles) : [];

    uploadedPublicIds.push(
      ...uploadedGalleryImages.map((image) => image.publicId),
    );

    const product = await createProduct({
      ...req.body,

      mainImage: uploadedMainImage.secureUrl,
      mainImagePublicId: uploadedMainImage.publicId,

      images: uploadedGalleryImages.map((image) => image.secureUrl),

      imagePublicIds: uploadedGalleryImages.map((image) => image.publicId),
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    // If database creation fails after Cloudinary upload,
    // remove the newly uploaded images.
    if (uploadedPublicIds.length > 0) {
      try {
        await deleteProductImages(uploadedPublicIds);
      } catch (cleanupError) {
        console.error(
          "Failed to clean up uploaded product images:",
          cleanupError,
        );
      }
    }

    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create product",
    });
  }
};

export const getAll: RequestHandler = async (req, res) => {
  try {
    const category =
      typeof req.query.category === "string" ? req.query.category : undefined;

    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const brand =
      typeof req.query.brand === "string" ? req.query.brand : undefined;

    const size =
      typeof req.query.size === "string" ? req.query.size : undefined;

    const color =
      typeof req.query.color === "string" ? req.query.color : undefined;

    const minPrice =
      typeof req.query.minPrice === "string"
        ? Number(req.query.minPrice)
        : undefined;

    const maxPrice =
      typeof req.query.maxPrice === "string"
        ? Number(req.query.maxPrice)
        : undefined;

    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;

    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 12;

    const result = await getProducts(
      category,
      search,
      brand,
      size,
      color,
      minPrice,
      maxPrice,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch products",
    });
  }
};

export const getById: RequestHandler = async (req, res) => {
  try {
    const productId = getStringParam(req.params.id);

    const product = await getProductById(productId);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch product",
    });
  }
};

export const getBySlug: RequestHandler = async (req, res) => {
  try {
    const slug = getStringParam(req.params.slug);

    const product = await getProductBySlug(slug);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch product",
    });
  }
};

export const update: RequestHandler = async (req, res) => {
  try {
    const productId = req.params.id;

    if (typeof productId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const existingProduct = await getAdminProductById(productId);

    if (!existingProduct) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    const files = getUploadedFiles(req);

    const mainImageFile = files?.mainImage?.[0];
    const galleryFiles = files?.images ?? [];

    const removeMainImage =
      req.body.removeMainImage === true || req.body.removeMainImage === "true";

    let removeImagePublicIds: string[] = [];

    if (req.body.removeImagePublicIds) {
      try {
        const parsed = JSON.parse(req.body.removeImagePublicIds);

        if (!Array.isArray(parsed)) {
          res.status(400).json({
            success: false,
            message: "removeImagePublicIds must be an array",
          });
          return;
        }

        removeImagePublicIds = parsed.filter(
          (value): value is string => typeof value === "string",
        );
      } catch {
        res.status(400).json({
          success: false,
          message: "removeImagePublicIds must be valid JSON",
        });
        return;
      }
    }

    let requestedImagePublicIds: string[] | undefined;

    if (req.body.imagePublicIds !== undefined) {
      try {
        const parsed = JSON.parse(req.body.imagePublicIds);

        if (!Array.isArray(parsed)) {
          res.status(400).json({
            success: false,
            message: "imagePublicIds must be an array",
          });
          return;
        }

        requestedImagePublicIds = parsed.filter(
          (value): value is string => typeof value === "string",
        );
      } catch {
        res.status(400).json({
          success: false,
          message: "imagePublicIds must be valid JSON",
        });
        return;
      }
    }

    const oldMainImagePublicId = existingProduct.mainImagePublicId;

    const oldGalleryPublicIds = existingProduct.imagePublicIds ?? [];

    const oldGalleryImages = existingProduct.images ?? [];

    const uploadedPublicIds: string[] = [];

    let newMainImage = existingProduct.mainImage;

    let newMainImagePublicId = existingProduct.mainImagePublicId;

    let newGalleryImages = [...oldGalleryImages];

    let newGalleryPublicIds = [...oldGalleryPublicIds];

    /*
     * ----------------------------------------------------
     * 1. Replace main image
     * ----------------------------------------------------
     */

    if (mainImageFile) {
      const uploadedMainImage = await uploadProductImage(mainImageFile.buffer);

      uploadedPublicIds.push(uploadedMainImage.publicId);

      newMainImage = uploadedMainImage.secureUrl;

      newMainImagePublicId = uploadedMainImage.publicId;
    }

    /*
     * ----------------------------------------------------
     * 2. Remove main image
     * ----------------------------------------------------
     */

    if (removeMainImage && !mainImageFile) {
      newMainImage = null;
      newMainImagePublicId = null;
    }

    /*
     * ----------------------------------------------------
     * 3. Remove gallery images
     * ----------------------------------------------------
     */

    if (removeImagePublicIds.length > 0) {
      const removeSet = new Set(removeImagePublicIds);

      const remainingIndexes = newGalleryPublicIds
        .map((publicId, index) => ({
          publicId,
          index,
        }))
        .filter(({ publicId }) => !removeSet.has(publicId));

      newGalleryImages = remainingIndexes.map(
        ({ index }) => newGalleryImages[index],
      );

      newGalleryPublicIds = remainingIndexes.map(({ publicId }) => publicId);
    }

    /*
     * ----------------------------------------------------
     * 4. Remember existing gallery images
     *
     * New images are uploaded below, but their public IDs
     * are not known to the frontend yet.
     * ----------------------------------------------------
     */

    const existingGalleryImagesBeforeUpload = [...newGalleryImages];

    const existingGalleryPublicIdsBeforeUpload = [...newGalleryPublicIds];

    /*
     * ----------------------------------------------------
     * 5. Add new gallery images
     * ----------------------------------------------------
     */

    if (galleryFiles.length > 0) {
      const uploadedGalleryImages = await uploadProductImages(galleryFiles);

      uploadedGalleryImages.forEach((image) => {
        uploadedPublicIds.push(image.publicId);
      });

      newGalleryImages.push(
        ...uploadedGalleryImages.map((image) => image.secureUrl),
      );

      newGalleryPublicIds.push(
        ...uploadedGalleryImages.map((image) => image.publicId),
      );
    }

    /*
     * ----------------------------------------------------
     * 6. Reorder existing gallery images
     *
     * The frontend only knows the public IDs of images
     * that already existed before this request.
     *
     * Newly uploaded images are automatically appended
     * after the reordered existing images.
     * ----------------------------------------------------
     */

    if (requestedImagePublicIds !== undefined) {
      const existingPublicIdSet = new Set(existingGalleryPublicIdsBeforeUpload);

      /*
       * Every requested ID must belong to an existing
       * gallery image.
       */
      const containsOnlyExistingIds = requestedImagePublicIds.every(
        (publicId) => existingPublicIdSet.has(publicId),
      );

      if (!containsOnlyExistingIds) {
        await deleteProductImages(uploadedPublicIds);

        res.status(400).json({
          success: false,
          message: "imagePublicIds contains an invalid gallery image",
        });
        return;
      }

      /*
       * Every existing gallery image must appear exactly
       * once in the requested ordering.
       */
      const uniqueRequestedIds = new Set(requestedImagePublicIds);

      if (
        uniqueRequestedIds.size !== requestedImagePublicIds.length ||
        uniqueRequestedIds.size !== existingGalleryPublicIdsBeforeUpload.length
      ) {
        await deleteProductImages(uploadedPublicIds);

        res.status(400).json({
          success: false,
          message:
            "imagePublicIds must contain every existing gallery image exactly once",
        });
        return;
      }

      /*
       * Map existing public IDs to their URLs.
       */
      const existingImageMap = new Map<string, string>();

      existingGalleryPublicIdsBeforeUpload.forEach((publicId, index) => {
        existingImageMap.set(
          publicId,
          existingGalleryImagesBeforeUpload[index],
        );
      });

      const reorderedExistingImages: string[] = [];

      const reorderedExistingPublicIds: string[] = [];

      for (const publicId of requestedImagePublicIds) {
        const imageUrl = existingImageMap.get(publicId);

        if (!imageUrl) {
          await deleteProductImages(uploadedPublicIds);

          res.status(400).json({
            success: false,
            message: "imagePublicIds contains an invalid gallery image",
          });
          return;
        }

        reorderedExistingImages.push(imageUrl);

        reorderedExistingPublicIds.push(publicId);
      }

      /*
       * Newly uploaded images are appended after the
       * reordered existing images.
       */
      const uploadedGalleryImagesCount =
        newGalleryPublicIds.length -
        existingGalleryPublicIdsBeforeUpload.length;

      const uploadedGalleryImagesStartIndex =
        existingGalleryImagesBeforeUpload.length;

      const newlyUploadedImages = newGalleryImages.slice(
        uploadedGalleryImagesStartIndex,
      );

      const newlyUploadedPublicIds = newGalleryPublicIds.slice(
        existingGalleryPublicIdsBeforeUpload.length,
      );

      /*
       * Safety check.
       */
      if (newlyUploadedImages.length !== uploadedGalleryImagesCount) {
        await deleteProductImages(uploadedPublicIds);

        res.status(400).json({
          success: false,
          message: "Failed to process newly uploaded gallery images",
        });
        return;
      }

      newGalleryImages = [...reorderedExistingImages, ...newlyUploadedImages];

      newGalleryPublicIds = [
        ...reorderedExistingPublicIds,
        ...newlyUploadedPublicIds,
      ];
    }

    /*
     * ----------------------------------------------------
     * 7. Update database
     * ----------------------------------------------------
     */

    try {
      const updatedProduct = await updateProduct(productId, {
        ...req.body,

        mainImage: newMainImage,

        mainImagePublicId: newMainImagePublicId,

        images: newGalleryImages,

        imagePublicIds: newGalleryPublicIds,
      });

      /*
       * ------------------------------------------------
       * 8. Delete old Cloudinary images
       *    ONLY after database update succeeds
       * ------------------------------------------------
       */

      const cloudinaryImagesToDelete: string[] = [];

      /*
       * Old main image replaced.
       */
      if (
        mainImageFile &&
        oldMainImagePublicId &&
        oldMainImagePublicId !== newMainImagePublicId
      ) {
        cloudinaryImagesToDelete.push(oldMainImagePublicId);
      }

      /*
       * Old main image removed.
       */
      if (removeMainImage && !mainImageFile && oldMainImagePublicId) {
        cloudinaryImagesToDelete.push(oldMainImagePublicId);
      }

      /*
       * Gallery images removed.
       */
      const removedGalleryPublicIds = oldGalleryPublicIds.filter(
        (publicId) => !newGalleryPublicIds.includes(publicId),
      );

      cloudinaryImagesToDelete.push(...removedGalleryPublicIds);

      if (cloudinaryImagesToDelete.length > 0) {
        await deleteProductImages(cloudinaryImagesToDelete);
      }

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      /*
       * Database update failed.
       * Delete newly uploaded Cloudinary files.
       */
      if (uploadedPublicIds.length > 0) {
        await deleteProductImages(uploadedPublicIds);
      }

      throw error;
    }
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update product",
    });
  }
};

export const remove: RequestHandler = async (req, res) => {
  try {
    const productId = getStringParam(req.params.id);

    const product = await deactivateProduct(productId);

    res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to deactivate product",
    });
  }
};

export const activate: RequestHandler = async (req, res) => {
  try {
    const productId = getStringParam(req.params.id);

    const product = await activateProduct(productId);

    res.status(200).json({
      success: true,
      message: "Product activated successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to activate product",
    });
  }
};

export const getAdminProducts: RequestHandler = async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const status =
      req.query.status === "active" || req.query.status === "inactive"
        ? req.query.status
        : "all";

    const page =
      typeof req.query.page === "string" ? Number(req.query.page) : 1;

    const limit =
      typeof req.query.limit === "string" ? Number(req.query.limit) : 20;

    const result = await fetchAdminProducts({
      search,
      status,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: "Admin products fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch admin products",
    });
  }
};

export const getAdminProduct: RequestHandler = async (req, res) => {
  try {
    const productId = getStringParam(req.params.id);

    const product = await getAdminProductById(productId);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Admin product fetched successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch admin product",
    });
  }
};

// ==================== VARIANTS ====================

export const createVariant: RequestHandler = async (req, res) => {
  try {
    const variant = await createProductVariant(req.body);

    res.status(201).json({
      success: true,
      message: "Product variant created successfully",
      data: variant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create product variant",
    });
  }
};

export const getVariantById: RequestHandler = async (req, res) => {
  try {
    const variantId = getStringParam(req.params.id);

    const variant = await getProductVariantById(variantId);

    if (!variant) {
      res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: variant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch product variant",
    });
  }
};

export const updateVariant: RequestHandler = async (req, res) => {
  try {
    const variantId = getStringParam(req.params.id);

    const variant = await updateProductVariant(variantId, req.body);

    res.status(200).json({
      success: true,
      message: "Product variant updated successfully",
      data: variant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update product variant",
    });
  }
};

export const removeVariant: RequestHandler = async (req, res) => {
  try {
    const variantId = getStringParam(req.params.id);

    const variant = await deactivateProductVariant(variantId);

    res.status(200).json({
      success: true,
      message: "Product variant deactivated successfully",
      data: variant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to deactivate product variant",
    });
  }
};
