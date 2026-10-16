import { v2 as cloudinary } from "cloudinary";

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
  throw new Error("Missing Cloudinary environment variables");
}

cloudinary.config({
  cloud_name: cloudinaryCloudName,
  api_key: cloudinaryApiKey,
  api_secret: cloudinaryApiSecret,
  secure: true,
});

export default cloudinary;
