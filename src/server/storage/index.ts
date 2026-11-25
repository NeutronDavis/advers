import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { sanitizeFileName } from "@/lib/media";

export interface StoredFile {
  storageKey: string;
  url: string;
}

/**
 * Local development storage driver. Files are written under public/uploads and
 * served directly by Next. Production must swap this for S3-compatible storage
 * with signed uploads and a persistent volume/CDN.
 */
export async function saveUploadedFile(input: {
  buffer: Buffer;
  originalName: string;
  userId: string;
}): Promise<StoredFile> {
  const safeName = sanitizeFileName(input.originalName);
  const fileName = `${randomUUID()}-${safeName}`;
  const relativeDir = path.posix.join("uploads", input.userId);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  await mkdir(absoluteDir, { recursive: true });

  const absolutePath = path.join(absoluteDir, fileName);
  await writeFile(absolutePath, input.buffer);

  const storageKey = path.posix.join(relativeDir, fileName);
  return { storageKey, url: `/${storageKey}` };
}

export async function deleteUploadedFile(storageKey: string): Promise<void> {
  const absolutePath = path.join(process.cwd(), "public", storageKey);
  try {
    await unlink(absolutePath);
  } catch {
    // Best-effort cleanup.
  }
}
