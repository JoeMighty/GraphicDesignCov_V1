/**
 * Deterministic pseudo-random in [0, 1), seeded by an integer — produces the
 * same value on server and client. Integer/bitwise math only (no Math.sin,
 * which can differ in its last bit between server and browser JS engines).
 */
export function seededRandom(seed: number) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}
