"use client";

import type { GalleryItem } from "./types";

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
    <div className="columns-1 gap-6 px-6 pb-32 sm:columns-2 lg:columns-3">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          onMouseEnter={() => onHover(item.id)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(item.id)}
          onBlur={() => onHover(null)}
          className="group mb-6 block w-full break-inside-avoid text-left"
        >
          <span
            ref={(el) => registerSlot(item.id, el)}
            className="block w-full overflow-hidden bg-white/5"
            style={{ aspectRatio: `${item.width} / ${item.height}` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.thumb_url}
              alt={item.title ?? `Work by ${item.student_name}`}
              loading="lazy"
              className="h-full w-full object-cover transition-opacity duration-200"
              style={{ opacity: hideImages ? 0 : 1 }}
            />
          </span>
          <span className="mt-2 flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            <span className="truncate">{item.student_name}</span>
            {item.title && <span className="truncate text-muted/60">{item.title}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
