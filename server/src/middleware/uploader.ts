import multer from "multer";
import type { RequestHandler } from "express";

type UploadType = "image";

const uploadConfig = {
  image: {
    fileSize: 5 * 1024 * 1024,
    allowedExtensions: [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ],
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
  },
};

const storage = multer.memoryStorage();

const uploader = (
  type: UploadType = "image",
): multer.Multer => {
  const config = uploadConfig[type];

  const fileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    callback,
  ) => {
    const fileExtension = file.originalname
      .split(".")
      .pop()
      ?.toLowerCase();

    const isValidExtension =
      !!fileExtension &&
      config.allowedExtensions.includes(fileExtension);

    const isValidMimeType =
      config.allowedMimeTypes.includes(file.mimetype);

    if (isValidExtension && isValidMimeType) {
      callback(null, true);
      return;
    }

    callback(
      new Error(
        "File format not supported. Only JPG, JPEG, PNG, and WebP images are allowed.",
      ),
    );
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: config.fileSize,
      files: 10,
    },
  });
};

export const uploadProductFiles: RequestHandler = (
  req,
  res,
  next,
) => {
  uploader("image").fields([
    {
      name: "mainImage",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 9,
    },
  ])(req, res, (error) => {
    if (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Image upload failed",
      });
      return;
    }

    next();
  });
};

export const requireMainProductImage: RequestHandler = (
  req,
  res,
  next,
) => {
  const files = req.files as
    | {
        mainImage?: Express.Multer.File[];
        images?: Express.Multer.File[];
      }
    | undefined;

  if (!files?.mainImage?.length) {
    res.status(400).json({
      success: false,
      message: "Main product image is required",
    });
    return;
  }

  next();
};

export default uploader;