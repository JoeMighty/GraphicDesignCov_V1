"use client";

import { motion } from "framer-motion";
import { setCursorLabel } from "@/lib/cursorSignal";
import type { GalleryItem } from "./types";

// Literal Tailwind class strings (kept as static arrays so the JIT compiler
// picks them up) — cycled by index to break the grid into an irregular,
// non-uniform composition instead of a tidy aligned masonry.
const SPANS = [
  "col-span-1 sm:col-span-2 lg:col-span-4",
  "col-span-1 sm:col-span-2 lg:col-span-3",
  "col-span-1 sm:col-span-4 lg:col-span-5",
  "col-span-1 sm:col-span-2 lg:col-span-3",
  "col-span-1 sm:col-span-2 lg:col-span-4",
  "col-span-1 sm:col-span-4 lg:col-span-3",
];

const OFFSETS = ["", "sm:mt-20", "sm:mt-6", "sm:-mt-8", "sm:mt-32", "sm:mt-2"];

// Rotation lives on the inner <button>, separate from the outer motion.div
// (which animates opacity/y — framer-motion writes its own inline
// `transform`, so a rotate utility on the same element would be clobbered).
const ROTATIONS = [
  "rotate-0 sm:-rotate-2",
  "rotate-0 sm:rotate-1",
  "rotate-0 sm:rotate-2",
  "rotate-0 sm:-rotate-1",
  "rotate-0",
];

export default function GalleryGrid({
  items,
  registerSlot,
  hideImages,
  onSelect,
  onHover,
}: {
  items: GalleryItem[];
  registerSlot: (id: string, el: HTMLElement | null) => void;
  hideImages: boolean;
  onSelect: (item: GalleryItem) => void;
  onHover: (id: string | null) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="px-6 py-32 text-center font-mono text-xs uppercase tracking-[0.15em] text-muted">
        No work published yet — check back soon.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-14 px-6 pb-40 sm:grid-cols-4 sm:gap-y-24 lg:grid-cols-8">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 72 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (i % 3) * 0.08 }}
          className={SPANS[i % SPANS.length] + " " + OFFSETS[i % OFFSETS.length]}
        >
          <button
            onClick={() => onSelect(item)}
            onMouseEnter={() => {
              onHover(item.id);
              setCursorLabel("VIEW");
            }}
            onMouseLeave={() => {
              onHover(null);
              setCursorLabel(null);
            }}
            onFocus={() => onHover(item.id)}
            onBlur={() => onHover(null)}
            className={`group block w-full text-left transition-transform duration-500 ease-out hover:rotate-0 ${ROTATIONS[i % ROTATIONS.length]}`}
          >
            <span
              ref={(el) => registerSlot(item.id, el)}
              className="relative block w-full overflow-hidden bg-white/5"
              style={{ aspectRatio: `${item.width} / ${item.height}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumb_url}
                alt={item.title ?? `Work by ${item.student_name}`}
                loading="lazy"
                className="h-full w-full object-cover grayscale transition-[opacity,filter,transform] duration-500 ease-out group-hover:scale-[1.05] group-hover:grayscale-0"
                style={{ opacity: hideImages ? 0 : 1 }}
              />

              {/* Hover caption — z-20 so it stays above the fixed WebGL canvas (z-10) */}
              <span className="pointer-events-none absolute inset-0 z-20 flex items-end bg-gradient-to-t from-black/80 via-black/0 to-black/0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="flex w-full items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.15em] text-white">
                  <span className="truncate">{item.student_name}</span>
                  {item.title && <span className="truncate text-white/60">{item.title}</span>}
                </span>
              </span>
            </span>
          </button>
        </motion.div>
      ))}
    </div>
  );
}
