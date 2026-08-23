import sharp from "sharp";

export const FULL_MAX_EDGE = 2400;
export const THUMB_MAX_EDGE = 900;

export type ProcessedImage = {
  full: Buffer;
  thumb: Buffer;
  width: number;
  height: number;
};

/**
 * Strips metadata, resizes, and re-encodes an uploaded image as WebP,
 * producing a full-size version and a smaller grid thumbnail.
 */
export async function processArtworkImage(input: Buffer): Promise<ProcessedImage> {
  const image = sharp(input, { failOn: "none" }).rotate(); // rotate() auto-orients then strips EXIF orientation
  const metadata = await image.metadata();

  const full = await image
    .clone()
    .resize({
      width: FULL_MAX_EDGE,
      height: FULL_MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer();

  const thumb = await image
    .clone()
    .resize({
      width: THUMB_MAX_EDGE,
      height: THUMB_MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 78 })
    .toBuffer();

  const fullMeta = await sharp(full).metadata();

  return {
    full,
    thumb,
    width: fullMeta.width ?? metadata.width ?? 0,
    height: fullMeta.height ?? metadata.height ?? 0,
  };
}
