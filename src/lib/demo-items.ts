import type { GalleryItem } from "@/components/gallery/types";

/**
 * Local placeholder pieces shown on the homepage until there's real approved
 * student work. Home page only falls back to these when the approved list
 * from Supabase is empty — real submissions replace them automatically.
 *
 * There are only 6 distinct demo images (public/demo/demo-1..6.svg); they're
 * reused across the 20 entries below (each reuse keeps that image's own
 * intrinsic width/height so nothing stretches) purely to populate the
 * canvas at a more realistic scale for testing the layout/interactions.
 */
const IMAGES = [
  { src: "/demo/demo-1.svg", width: 600, height: 800 },
  { src: "/demo/demo-2.svg", width: 800, height: 600 },
  { src: "/demo/demo-3.svg", width: 700, height: 700 },
  { src: "/demo/demo-4.svg", width: 640, height: 800 },
  { src: "/demo/demo-5.svg", width: 750, height: 600 },
  { src: "/demo/demo-6.svg", width: 600, height: 900 },
];

const ENTRIES: { name: string; title: string }[] = [
  { name: "Amara Voss", title: "Form / Void" },
  { name: "Theo Marsh", title: "Signal / Noise" },
  { name: "Priya Nandan", title: "Grid Study 04" },
  { name: "Leo Fenwick", title: "Halftone" },
  { name: "Iris Okafor", title: "Runout" },
  { name: "Jonas Wren", title: "Tidal" },
  { name: "Mira Solano", title: "Afterimage" },
  { name: "Kofi Adjei", title: "Static Bloom" },
  { name: "Yuna Park", title: "Negative Space" },
  { name: "Dario Conti", title: "Split Signal" },
  { name: "Freya Lindqvist", title: "Overexposed" },
  { name: "Malik Osei", title: "Loop 03" },
  { name: "Elena Vasquez", title: "Paper Cut" },
  { name: "Ravi Deshmukh", title: "Type Study" },
  { name: "Noor Haddad", title: "Fragment" },
  { name: "Sasha Petrov", title: "Underlay" },
  { name: "Camille Girard", title: "Echo Chamber" },
  { name: "Tomas Novak", title: "Ink Bleed" },
  { name: "Aaliyah Brooks", title: "Wireframe" },
  { name: "Hana Kobayashi", title: "Drift" },
];

export const DEMO_ITEMS: GalleryItem[] = ENTRIES.map((entry, i) => {
  const image = IMAGES[i % IMAGES.length];
  return {
    id: `demo-${i + 1}`,
    student_name: entry.name,
    title: entry.title,
    width: image.width,
    height: image.height,
    thumb_url: image.src,
    image_url: image.src,
    instagram_url: null,
    behance_url: null,
    website_url: null,
  };
});
