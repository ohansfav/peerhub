const { S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
dotenv.config();

const isTests = process.env.NODE_ENV === "test";
const isDev = process.env.NODE_ENV === "development";

// In production, R2 credentials are required
if (!isTests && !isDev) {
  if (
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.S3_BUCKET_NAME ||
    !process.env.CLOUDFLARE_ACCOUNT_ID
  ) {
    throw new Error("Missing r2 environment variables");
  }
}

let r2Client = null;

// Create client only if credentials are available
if (
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.S3_BUCKET_NAME &&
  process.env.CLOUDFLARE_ACCOUNT_ID
) {
  r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
}

module.exports = { r2Client, isTests };
