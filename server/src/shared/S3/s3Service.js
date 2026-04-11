const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const logger = require("../utils/logger");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const path = require("path");
const fs = require("fs");
// const { s3Client: client, isTests } = require("./s3Client");
const { r2Client: client, isTests } = require("./r2Client");

const LOCAL_UPLOAD_DIR = path.join(__dirname, "../../../uploads");

async function uploadFileToS3(file, folder = "uploads") {
  if (isTests) {
    logger.warn("⚠️ Running in test mode: S3 uploads are mocked.");
    return { key: `${folder}/${Date.now()}_${file.originalname}` };
  }

  // Save locally if client is not configured (development mode)
  if (!client) {
    logger.warn("⚠️ S3 client not configured: saving file locally.");
    const key = `${folder}/${Date.now()}_${file.originalname}`;
    const localPath = path.join(LOCAL_UPLOAD_DIR, key);
    fs.mkdirSync(path.dirname(localPath), { recursive: true });
    fs.writeFileSync(localPath, file.buffer);
    return { key };
  }

  const key = `${folder}/${Date.now()}_${file.originalname}`;

  await client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return { key };
}

async function getSignedFileUrl(key, expiresIn = 300) {
  if (isTests) {
    logger.warn("⚠️ Running in test mode: S3 URLs are mocked.");
    return `https://example.com/dev-s3-bucket/${key}`; // Mock URL for tests
  }

  // Serve from local uploads if client is not configured (development mode)
  if (!client) {
    const localPath = path.join(LOCAL_UPLOAD_DIR, key);
    if (fs.existsSync(localPath)) {
      const port = process.env.PORT || 3000;
      return `/api/uploads/${key}`;
    }
    logger.warn("⚠️ S3 client not configured and local file not found.");
    return `/api/uploads/${key}`;
  }

  // default 5 min
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(client, command, { expiresIn });
}

module.exports = { uploadFileToS3, getSignedFileUrl, LOCAL_UPLOAD_DIR };
