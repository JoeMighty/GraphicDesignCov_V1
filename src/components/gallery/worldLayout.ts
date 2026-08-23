import { seededRandom } from "@/lib/seededRandom";
import { WORLD_SIZE } from "./useCanvasCamera";
import type { GalleryItem } from "./types";

const ITEM_WIDTH = 320;
const CELL_SIZE = 480;

export type WorldItem = {
  item: GalleryItem;
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Places every piece at the same base width (keeping its own aspect ratio
 * for height) on a jittered grid centered in the world, in a seeded-random
 * order — reshuffled per visit via `seed`, same seed always gives the same
 * layout (needed to keep server/client render in sync at seed 0).
 */
export function layoutWorld(items: GalleryItem[], seed: number): WorldItem[] {
  if (items.length === 0) return [];

  const cols = Math.max(2, Math.ceil(Math.sqrt(items.length * 1.3)));
  const rows = Math.ceil(items.length / cols);
  const gridW = cols * CELL_SIZE;
  const gridH = rows * CELL_SIZE;
  const originX = WORLD_SIZE / 2 - gridW / 2;
  const originY = WORLD_SIZE / 2 - gridH / 2;

  const order = items.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i * 7919) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  return order.map((itemIndex, slot) => {
    const item = items[itemIndex];
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    const jitterX = (seededRandom(seed + itemIndex * 13 + 1) - 0.5) * CELL_SIZE * 0.55;
    const jitterY = (seededRandom(seed + itemIndex * 13 + 2) - 0.5) * CELL_SIZE * 0.55;
    const cx = originX + col * CELL_SIZE + CELL_SIZE / 2 + jitterX;
    const cy = originY + row * CELL_SIZE + CELL_SIZE / 2 + jitterY;
    const width = ITEM_WIDTH;
    const height = width * (item.height / item.width);
    return { item, x: cx - width / 2, y: cy - height / 2, width, height };
  });
}

/** The representation of `coord` closest to `camera`, wrapping through the
 * torus — keeps items sliding smoothly through view instead of jumping,
 * except for a single flip at the antipodal point (kept off-screen as long
 * as WORLD_SIZE is comfortably larger than the viewport). */
export function nearestWrapped(coord: number, camera: number, size: number) {
  let d = coord - camera;
  d = (((d + size / 2) % size) + size) % size - size / 2;
  return camera + d;
}
