/**
 * Cloudflare R2 image upload module.
 *
 * ── Required Railway / Railway-staging env vars ────────────────────────────
 *   R2_ACCOUNT_ID        Your Cloudflare account ID (found in R2 dashboard)
 *   R2_ACCESS_KEY_ID     R2 API token — Access Key ID
 *   R2_SECRET_ACCESS_KEY R2 API token — Secret Access Key
 *   R2_BUCKET            R2 bucket name  (e.g. fitfinder-uploads)
 *   R2_PUBLIC_URL        Public URL of the bucket
 *                        (e.g. https://uploads.fitfinder.co)
 *
 * ── How to create the API token ───────────────────────────────────────────
 *   1. Cloudflare dashboard → R2 → Manage R2 API Tokens
 *   2. Create a token with "Object Read & Write" permission on your bucket
 *   3. Copy the Access Key ID and Secret Access Key into Railway env vars
 *
 * ── Without these vars ────────────────────────────────────────────────────
 *   The module falls back to storing base64 data-URLs directly in PostgreSQL.
 *   This works for development / demos but WILL bloat the database in
 *   production — set up R2 before you have real users uploading photos.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET || "fitfinder-uploads";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // e.g., https://uploads.fitfinder.co

// ── R2 availability check ──────────────────────────────────────────────────
const r2Configured =
  Boolean(R2_ACCOUNT_ID) &&
  Boolean(R2_ACCESS_KEY) &&
  Boolean(R2_SECRET_KEY) &&
  Boolean(R2_PUBLIC_URL);

/**
 * Whether R2 is configured and active. Exported so the health endpoint and
 * other modules can report the storage mode without importing the client.
 */
export const isR2Active = r2Configured;

// Log a startup warning exactly once so it's easy to spot in Railway logs.
if (!r2Configured) {
  console.warn(
    "[upload] ⚠️  R2 storage is NOT configured — images will be stored as base64 " +
    "in PostgreSQL. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, " +
    "R2_BUCKET, and R2_PUBLIC_URL to enable object storage."
  );
} else {
  console.log("[upload] ✅ R2 storage configured — images will be stored in Cloudflare R2.");
}

const s3 = r2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY!,
        secretAccessKey: R2_SECRET_KEY!,
      },
    })
  : null;

/**
 * Upload a base64 data URL image. Returns a public URL when R2 is configured,
 * or the original data URL as a fallback (dev / no-R2 mode).
 */
export async function uploadImage(
  base64DataUrl: string,
  folder: string = "avatars"
): Promise<string> {
  const matches = base64DataUrl.match(/^data:image\/(jpeg|png|webp|gif);base64,(.+)$/);
  if (!matches) throw new Error("Invalid image data URL");

  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const buffer = Buffer.from(matches[2], "base64");

  const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
  if (buffer.length > MAX_BYTES) {
    throw new Error(
      `Image too large (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Maximum allowed is 8 MB.`
    );
  }

  const hash = crypto.randomBytes(8).toString("hex");
  const key = `${folder}/${hash}.${ext}`;

  // Graceful fallback to base64 storage when R2 is not configured
  if (!s3 || !R2_PUBLIC_URL) {
    console.log("[upload] R2 not configured — storing image as base64 (dev fallback)");
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
 * No-ops gracefully if the URL is not an R2 URL or R2 is not configured.
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
