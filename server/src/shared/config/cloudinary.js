const cloudinary = require("cloudinary").v2;

const isTests = process.env.NODE_ENV === "test";
const isDev = process.env.NODE_ENV === "development";

// In production, Cloudinary credentials are required
if (!isTests && !isDev) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Missing Cloudinary environment variables");
  }
}

// Configure if credentials are available
if (
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_API_KEY ||
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

module.exports = cloudinary;
