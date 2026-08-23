"use client";

import { motion } from "framer-motion";
import { setCursorLabel } from "@/lib/cursorSignal";
import { layoutForIndex, rotationClassForIndex } from "./layout";
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
    <div className="flex flex-col gap-16 px-6 pb-48 sm:gap-24">
      {items.map((item, i) => {
        const layout = layoutForIndex(i);
        return (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 90 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col gap-4 ${layout.width} ${layout.align}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3 font-mono text-xs uppercase tracking-[0.15em]">
              <span className="text-muted">
                {String(i + 1).padStart(2, "0")} — <span className="text-foreground">{item.student_name}</span>
                {item.title && <span className="text-muted"> — {item.title}</span>}
              </span>
              <span className="flex gap-3 text-muted">
                {item.instagram_url && (
                  <a
                    href={item.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="transition hover:text-accent"
                  >
                    [ig]
                  </a>
                )}
                {item.behance_url && (
                  <a
                    href={item.behance_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="transition hover:text-accent"
                  >
                    [behance]
                  </a>
                )}
                {item.website_url && (
                  <a
                    href={item.website_url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="transition hover:text-accent"
                  >
                    [site]
                  </a>
                )}
              </span>
            </div>

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
              ref={(el) => registerSlot(item.id, el)}
              className={`group relative block w-full overflow-hidden bg-white/5 text-left ${rotationClassForIndex(i)}`}
              style={{ aspectRatio: `${item.width} / ${item.height}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumb_url}
                alt={item.title ?? `Work by ${item.student_name}`}
                loading="lazy"
                className="h-full w-full object-cover grayscale transition-[opacity,filter,transform] duration-500 ease-out group-hover:scale-[1.06] group-hover:grayscale-0"
                style={{ opacity: hideImages ? 0 : 1 }}
              />
            </button>
          </motion.article>
        );
      })}
    </div>
  );
}
