import multer from "multer";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(
      new Error(
        "Invalid image type. Only JPG, JPEG, PNG, and WebP are allowed.",
      ),
    );
    return;
  }

  callback(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

export default upload;
