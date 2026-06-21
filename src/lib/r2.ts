import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
  // AWS SDK v3 adds CRC32 checksums by default. These end up in the presigned
  // URL query string and browsers can't compute them before sending — 403 on PUT.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

export async function getPresignedUploadUrl(key: string): Promise<string> {
  const command = new PutObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(r2, command, { expiresIn: 300 }); // 5 minutes
}

export async function getPresignedDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(r2, command, { expiresIn: 3600 });
}

export async function deleteR2Files(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  // DeleteObjects accepts up to 1000 keys per call
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    await r2.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: batch.map((Key) => ({ Key })) },
      }),
    );
  }
}
