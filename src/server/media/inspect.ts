import sharp from "sharp";

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
}

export async function inspectImage(buffer: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read the image dimensions.");
  }
  if (metadata.width > 12_000 || metadata.height > 12_000) {
    throw new Error("Image dimensions are too large.");
  }
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format ?? "unknown",
  };
}
