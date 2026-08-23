// Deterministic per-index layout variation for a scattered, overlapping
// collage rhythm: a flex-wrap container (see GalleryGrid) lets multiple
// pieces share a row when their widths allow it, and negative-margin
// offsets pull items up into the row above for an overlapping feel —
// inspired by eloyb.design's spacious, non-uniform composition, pushed
// further into an actual broken/overlapping layout per feedback.

const WIDTHS = [
  "w-full sm:w-1/2 lg:w-2/5",
  "w-full sm:w-1/2 lg:w-1/3",
  "w-full sm:w-full lg:w-3/5",
  "w-full sm:w-1/2 lg:w-1/3",
  "w-full sm:w-1/2 lg:w-2/5",
  "w-full sm:w-full lg:w-1/2",
  "w-full sm:w-1/2 lg:w-1/4",
  "w-full sm:w-1/2 lg:w-3/5",
  "w-full sm:w-1/3 lg:w-1/3",
];

const OFFSETS = [
  "",
  "sm:-mt-16 lg:-mt-28",
  "sm:mt-10",
  "sm:-mt-8 lg:-mt-16",
  "sm:mt-16",
  "sm:-mt-20 lg:-mt-32",
  "sm:mt-4",
  "sm:-mt-12",
  "sm:mt-8",
];

export function layoutForIndex(i: number) {
  return {
    width: WIDTHS[i % WIDTHS.length],
    offset: OFFSETS[i % OFFSETS.length],
  };
}
