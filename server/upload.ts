import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || "fitfinder-uploads";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // e.g., https://uploads.fitfinder.co

const s3 =
  R2_ACCOUNT_ID && R2_ACCESS_KEY && R2_SECRET_KEY
    ? new S3Client({
        region: "auto",
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: R2_ACCESS_KEY,
          secretAccessKey: R2_SECRET_KEY,
        },
      })
    : null;

/**
 * Upload a base64 data URL image. Returns a public URL when R2 is configured,
 * or the original data URL as a fallback (dev mode).
 */
export async function uploadImage(
  base64DataUrl: string,
  folder: string = "avatars"
): Promise<string> {
  const matches = base64DataUrl.match(/^data:image\/(jpeg|png|webp|gif);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image data URL");

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const buffer = Buffer.from(matches[2], "base64");
  const hash = crypto.randomBytes(8).toString("hex");
  const key = `${folder}/${hash}.${ext}`;

  // Fall back to base64 storage if R2 is not configured
  if (!s3 || !R2_PUBLIC_URL) {
    console.log("[upload] R2 not configured — storing image as base64");
    return base64DataUrl;
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: `image/${matches[1]}`,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete an image from R2 by its public URL.
 * No-ops if the URL is not an R2 URL or R2 is not configured.
 */
export async function deleteImage(url: string): Promise<void> {
  if (!s3 || !R2_PUBLIC_URL || !url.startsWith(R2_PUBLIC_URL)) return;
  const key = url.replace(`${R2_PUBLIC_URL}/`, "");
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch (e) {
    console.error("[upload] Failed to delete image from R2:", e);
  }
}
