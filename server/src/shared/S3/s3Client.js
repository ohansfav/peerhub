const { S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
dotenv.config();

const isTests = process.env.NODE_ENV === "test";

let s3Client = null;

// Create client only if credentials are available
if (
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.S3_BUCKET_NAME &&
  process.env.AWS_REGION
) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
} else if (!isTests) {
  console.warn(
    "⚠️  AWS S3 credentials not configured. File storage will be unavailable until AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME, and AWS_REGION are set."
  );
}

module.exports = { s3Client, isTests };
