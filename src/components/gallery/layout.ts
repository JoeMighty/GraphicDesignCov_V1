// Deterministic per-index layout variation, shared between the DOM (Tailwind
// classes, used directly and as the fallback when WebGL is off) and the
// WebGL layer (numeric rotation applied to meshes) so both stay visually
// consistent — the DOM element carrying the rotation/width is also the one
// the WebGL layer tracks, so the mesh must match it.
//
// Single-column, large-format rhythm (inspired by eloyb.design's spacious
// one-project-at-a-time case-study layout) instead of a packed photo grid —
// each piece gets real room, alternating width and alignment down the page.

const LAYOUTS = [
  { width: "w-full sm:max-w-sm", align: "self-start" },
  { width: "w-full sm:max-w-md", align: "self-end" },
  { width: "w-full sm:max-w-xs", align: "self-start" },
  { width: "w-full sm:max-w-lg", align: "self-end" },
  { width: "w-full sm:max-w-sm", align: "self-start" },
  { width: "w-full sm:max-w-md", align: "self-end" },
];

const ROTATION_PAIRS: { className: string; deg: number }[] = [
  { className: "-rotate-1", deg: -1 },
  { className: "rotate-1", deg: 1 },
  { className: "rotate-2", deg: 2 },
  { className: "-rotate-2", deg: -2 },
  { className: "rotate-0", deg: 0 },
  { className: "-rotate-1", deg: -1 },
];

export function layoutForIndex(i: number) {
  return LAYOUTS[i % LAYOUTS.length];
}

export function rotationClassForIndex(i: number) {
  return ROTATION_PAIRS[i % ROTATION_PAIRS.length].className;
}

export function rotationDegForIndex(i: number) {
  return ROTATION_PAIRS[i % ROTATION_PAIRS.length].deg;
}
