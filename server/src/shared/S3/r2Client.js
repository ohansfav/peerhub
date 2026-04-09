const { S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
dotenv.config();

const isTests = process.env.NODE_ENV === "test";

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
} else if (!isTests) {
  console.warn(
    "⚠️  R2 credentials not configured. File storage will use mock responses until R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, S3_BUCKET_NAME, and CLOUDFLARE_ACCOUNT_ID are set."
  );
}

module.exports = { r2Client, isTests };
