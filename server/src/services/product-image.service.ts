import cloudinary from "../config/cloudinary.js";

export interface UploadedProductImage {
  secureUrl: string;
  publicId: string;
}

export const uploadProductImage = (
  buffer: Buffer,
): Promise<UploadedProductImage> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "clothing-store/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error(error?.message || "Failed to upload product image"));

          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    stream.end(buffer);
  });
};

export const deleteProductImage = (publicId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(new Error(error.message || "Failed to delete product image"));

          return;
        }

        if (result.result !== "ok" && result.result !== "not found") {
          reject(new Error("Failed to delete product image"));

          return;
        }

        resolve();
      },
    );
  });
};

export const uploadProductImages = async (
  files: Express.Multer.File[],
): Promise<UploadedProductImage[]> => {
  return Promise.all(files.map((file) => uploadProductImage(file.buffer)));
};

export const deleteProductImages = async (
  publicIds: string[],
): Promise<void> => {
  await Promise.all(publicIds.map((publicId) => deleteProductImage(publicId)));
};
