import { seededPick } from "@/lib/seededRandom";

// Layout variation for a scattered, overlapping collage rhythm: a flex-wrap
// container (see GalleryGrid) lets multiple pieces share a row when their
// widths allow it, and negative-margin offsets pull items up into the row
// above for an overlapping feel.
//
// `sessionSeed` reshuffles which width/offset each piece gets — passing 0
// (the default, used for the server-rendered/first-paint markup) gives a
// stable baseline arrangement; GalleryGrid randomizes it client-side after
// mount so the arrangement is different on every visit/refresh.

// 1-per-row on mobile (all start w-full), widening the possible column
// count as the viewport grows — down to 1/5 at xl, so up to 5 pieces can
// share the widest rows.
const WIDTHS = [
  "w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5",
  "w-full sm:w-1/2 md:w-2/3 lg:w-1/2 xl:w-2/5",
  "w-full sm:w-full md:w-1/3 lg:w-1/4 xl:w-1/5",
  "w-full sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/4",
  "w-full sm:w-1/2 md:w-1/3 lg:w-2/5 xl:w-1/5",
  "w-full sm:w-full md:w-2/3 lg:w-1/2 xl:w-2/5",
  "w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5",
  "w-full sm:w-1/2 md:w-1/2 lg:w-1/3 xl:w-2/5",
  "w-full sm:w-full md:w-1/2 lg:w-2/5 xl:w-1/5",
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

export function layoutForIndex(i: number, sessionSeed = 0) {
  return {
    width: seededPick(WIDTHS, i * 7919 + sessionSeed),
    offset: seededPick(OFFSETS, i * 104729 + sessionSeed),
  };
}
