import { seededRandom } from "@/lib/seededRandom";

/**
 * Deterministic seeded shuffle (Fisher-Yates) — the same seed always
 * produces the same order. Passing 0 (used for the server-rendered/
 * first-paint markup) keeps server and client in sync; GalleryGrid
 * randomizes the seed once on mount so the order differs per visit.
 */
export function shuffleItems<T>(items: T[], seed: number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i * 7919) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
