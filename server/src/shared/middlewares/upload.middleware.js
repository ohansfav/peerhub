const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("@src/shared/config/cloudinary");
const ApiError = require("@utils/apiError");
const path = require("path");
const fs = require("fs");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ------------------
// S3 Uploads (PDFs + images)
// ------------------
const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

const memoryStorage = multer.memoryStorage();

const s3FileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError("Invalid file type", 400, {
        allowed: allowedTypes,
        received: file.mimetype,
      })
    );
  }
};

const uploadS3 = multer({
  storage: memoryStorage,
  fileFilter: s3FileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// ------------------
// Profile Pic Uploads (Cloudinary with local fallback)
// ------------------
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

const cloudinaryFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ApiError("Only image files are allowed!", 400));
  }
};

let uploadProfilePic;

if (isCloudinaryConfigured) {
  // Use Cloudinary storage
  const folder =
    process.env.NODE_ENV === "production"
      ? "user_profiles"
      : "dev_user_profiles";

  const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
  });

  uploadProfilePic = multer({
    storage: cloudinaryStorage,
    fileFilter: cloudinaryFileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
} else {
  // Local disk fallback when Cloudinary is not configured
  const LOCAL_PROFILE_DIR = path.join(__dirname, "../../../uploads/profiles");
  fs.mkdirSync(LOCAL_PROFILE_DIR, { recursive: true });

  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, LOCAL_PROFILE_DIR);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      cb(null, safeName);
    },
  });

  uploadProfilePic = multer({
    storage: localStorage,
    fileFilter: cloudinaryFileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
}

// ------------------
// Exports
// ------------------
module.exports = {
  uploadSingleS3: uploadS3.single("file"), // Tutor docs → S3
  uploadSingleProfilePic: uploadProfilePic.single("file"), // User profile pics → Cloudinary or local
};
