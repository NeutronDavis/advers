"use server";

import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  MAX_MEDIA_BYTES,
  mediaKindFromMime,
  type MediaAssetDTO,
} from "@/lib/media";
import { enforceRateLimit } from "@/server/security/rate-limit";
import { inspectImage } from "@/server/media/inspect";
import { deleteUploadedFile, saveUploadedFile } from "@/server/storage";

export type UploadMediaResult =
  | { success: true; asset: MediaAssetDTO }
  | { success: false; error: string };

function optionalInt(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : null;
}

export async function uploadMediaAssetAction(
  formData: FormData
): Promise<UploadMediaResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please sign in to upload media." };

  const limited = await enforceRateLimit(
    `media-upload:${session.id}`,
    20,
    60_000
  );
  if (!limited.allowed) {
    return {
      success: false,
      error: `Too many uploads. Try again in ${Math.ceil(limited.retryAfterMs / 1000)}s.`,
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "Choose a file to upload." };
  }
  if (file.size <= 0) {
    return { success: false, error: "The file is empty." };
  }
  const maxBytes = Number(process.env.MAX_MEDIA_BYTES ?? MAX_MEDIA_BYTES);
  if (file.size > maxBytes) {
    return {
      success: false,
      error: `File is too large. Maximum is ${Math.round(maxBytes / 1024 / 1024)} MB.`,
    };
  }

  const mime = file.type.toLowerCase();
  const kind = mediaKindFromMime(mime);
  if (!kind) {
    return {
      success: false,
      error: "Unsupported file type. Use JPEG, PNG, WebP, MP4, WebM, MP3, WAV, OGG or PDF.",
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let width = optionalInt(formData.get("width"));
  let height = optionalInt(formData.get("height"));
  let durationSec = optionalInt(formData.get("durationSec"));
  let metadataSource = "CLIENT";

  if (kind === "IMAGE") {
    try {
      const metadata = await inspectImage(buffer);
      width = metadata.width;
      height = metadata.height;
      durationSec = null;
      metadataSource = "SERVER";
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Invalid image file.",
      };
    }
  }

  const stored = await saveUploadedFile({
    buffer,
    originalName: file.name,
    userId: session.id,
  });

  try {
    const asset = await prisma.mediaAsset.create({
      data: {
        ownerId: session.id,
        kind,
        storageKey: stored.storageKey,
        url: stored.url,
        mime,
        bytes: file.size,
        width,
        height,
        durationSec,
        metadataSource,
        checksum: createHash("sha256").update(buffer).digest("hex"),
        scanStatus: "PENDING",
        status: "VALIDATED",
      },
    });

    return {
      success: true,
      asset: {
        id: asset.id,
        url: asset.url,
        kind,
        mime: asset.mime,
        bytes: asset.bytes,
        width: asset.width,
        height: asset.height,
        durationSec: asset.durationSec,
      },
    };
  } catch (error) {
    await deleteUploadedFile(stored.storageKey);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not save the media asset.",
    };
  }
}
