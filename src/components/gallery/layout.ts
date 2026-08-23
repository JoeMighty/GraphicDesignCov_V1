// Deterministic per-index layout variation for the single-column, alternating
// -width case-study rhythm (inspired by eloyb.design): each piece gets its
// own row with a varied max-width and left/right alignment.

const LAYOUTS = [
  { width: "w-full sm:max-w-sm", align: "self-start" },
  { width: "w-full sm:max-w-md", align: "self-end" },
  { width: "w-full sm:max-w-xs", align: "self-start" },
  { width: "w-full sm:max-w-lg", align: "self-end" },
  { width: "w-full sm:max-w-sm", align: "self-start" },
  { width: "w-full sm:max-w-md", align: "self-end" },
];

export function layoutForIndex(i: number) {
  return LAYOUTS[i % LAYOUTS.length];
}
