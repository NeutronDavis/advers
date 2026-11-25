/**
 * Phase 5 media smoke test.
 *
 * Usage: npm run media:smoke
 * Generates a small PNG, stores it through the local driver, inspects it and
 * creates a MediaAsset, then removes everything.
 */
import { createHash } from "crypto";
import sharp from "sharp";
import { prisma } from "../src/lib/prisma";
import { inspectImage } from "../src/server/media/inspect";
import { deleteUploadedFile, saveUploadedFile } from "../src/server/storage";

async function main(): Promise<void> {
  const user = await prisma.user.create({
    data: {
      email: `media-smoke-${Date.now()}@example.com`,
      name: "Media Smoke",
      role: "CLIENT",
      status: "ACTIVE",
    },
  });

  let storageKey: string | null = null;
  try {
    const buffer = await sharp({
      create: { width: 640, height: 360, channels: 3, background: "#e8b64b" },
    })
      .png()
      .toBuffer();

    const stored = await saveUploadedFile({
      buffer,
      originalName: "smoke creative.png",
      userId: user.id,
    });
    storageKey = stored.storageKey;

    const metadata = await inspectImage(buffer);
    if (metadata.width !== 640 || metadata.height !== 360) {
      throw new Error(`Unexpected image metadata: ${JSON.stringify(metadata)}`);
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        ownerId: user.id,
        kind: "IMAGE",
        storageKey: stored.storageKey,
        url: stored.url,
        mime: "image/png",
        bytes: buffer.length,
        width: metadata.width,
        height: metadata.height,
        metadataSource: "SERVER",
        checksum: createHash("sha256").update(buffer).digest("hex"),
        scanStatus: "CLEAN",
        status: "VALIDATED",
      },
    });

    console.log("Media smoke test passed.");
    console.log(`  asset: ${asset.id}`);
    console.log(`  url: ${asset.url}`);
    console.log(`  dimensions: ${asset.width}x${asset.height}`);
    console.log(`  bytes: ${asset.bytes}`);
  } finally {
    if (storageKey) await deleteUploadedFile(storageKey);
    await prisma.mediaAsset.deleteMany({ where: { ownerId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Media smoke test failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
