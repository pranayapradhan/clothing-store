import cloudinary from "../config/cloudinary.js";

export interface UploadedImage {
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const uploadProductImage = (buffer: Buffer): Promise<UploadedImage> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "clothing-store/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error(error?.message || "Failed to upload image"));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      },
    );

    uploadStream.end(buffer);
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
          reject(new Error(error.message || "Failed to delete image"));
          return;
        }

        if (result.result !== "ok" && result.result !== "not found") {
          reject(new Error("Failed to delete image from Cloudinary"));
          return;
        }

        resolve();
      },
    );
  });
};
