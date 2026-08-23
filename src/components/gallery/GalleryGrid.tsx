"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { setCursorLabel } from "@/lib/cursorSignal";
import ScrambleText from "@/components/ScrambleText";
import { layoutForIndex } from "./layout";
import type { GalleryItem } from "./types";

// Deterministic pseudo-random in [0, 1), seeded by index — same value on
// server and client. Integer/bitwise math only (no Math.sin, which can
// differ in its last bit between server and browser JS engines and was
// causing a hydration mismatch here).
function seededRandom(seed: number) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

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
    <div className="flex flex-wrap gap-x-6 gap-y-16 px-6 pb-48 sm:gap-x-10">
      {items.map((item, i) => {
        const layout = layoutForIndex(i);
        return (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 90 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-20 ${layout.width} ${layout.offset}`}
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
              ref={(el) => registerSlot(item.id, el)}
              className="glitch-frame group relative block w-full overflow-hidden bg-white/5 text-left transition-transform duration-300 ease-out hover:scale-[1.015]"
              style={
                {
                  aspectRatio: `${item.width} / ${item.height}`,
                  "--glitch-bg": `url(${item.thumb_url})`,
                  "--glitch-duration": `${6 + seededRandom(i) * 6}s`,
                  "--glitch-delay": `${seededRandom(i + 100) * 8}s`,
                } as CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumb_url}
                alt={item.title ?? `Work by ${item.student_name}`}
                loading="lazy"
                className="h-full w-full object-cover grayscale transition-[opacity,filter] duration-500 ease-out group-hover:grayscale-0"
                style={{ opacity: hideImages ? 0 : 1 }}
              />

              {/* Persistent index tag */}
              <span className="pointer-events-none absolute left-3 top-3 z-20 font-mono text-[10px] uppercase tracking-[0.15em] text-white/70 mix-blend-difference">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Hover reveal — z-20 so it stays above the fixed WebGL canvas (z-10) */}
              <span className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:p-6">
                <ScrambleText
                  as="span"
                  text={item.student_name}
                  className="block font-display text-2xl uppercase leading-none text-white sm:text-3xl"
                />
                {item.title && (
                  <span className="mt-2 block font-mono text-xs uppercase tracking-[0.15em] text-white/70">
                    {item.title}
                  </span>
                )}
                <span className="mt-3 flex gap-4 font-mono text-[10px] uppercase tracking-[0.15em] text-white/70">
                  {item.instagram_url && (
                    <a
                      href={item.instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="pointer-events-auto transition hover:text-accent"
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
                      className="pointer-events-auto transition hover:text-accent"
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
                      className="pointer-events-auto transition hover:text-accent"
                    >
                      [site]
                    </a>
                  )}
                </span>
              </span>
            </button>
          </motion.article>
        );
      })}
    </div>
  );
}
