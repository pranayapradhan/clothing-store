import type { RequestHandler } from "express";
import {
  deleteProductImage,
  uploadProductImage,
} from "../services/image.service.js";

export const upload: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "Image file is required",
      });
      return;
    }

    const image = await uploadProductImage(req.file.buffer);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: image,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to upload image",
    });
  }
};

export const remove: RequestHandler = async (req, res) => {
  try {
    const publicId =
      typeof req.body.publicId === "string" ? req.body.publicId.trim() : "";

    if (!publicId) {
      res.status(400).json({
        success: false,
        message: "Cloudinary public ID is required",
      });
      return;
    }

    await deleteProductImage(publicId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete image",
    });
  }
};
