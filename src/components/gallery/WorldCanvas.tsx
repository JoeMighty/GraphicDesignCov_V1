"use client";

import { useEffect, useMemo, useState, type CSSProperties, type RefObject } from "react";
import { setCursorLabel } from "@/lib/cursorSignal";
import { seededRandom } from "@/lib/seededRandom";
import ScrambleText from "@/components/ScrambleText";
import { layoutWorld, nearestWrapped } from "./worldLayout";
import { WORLD_SIZE, type Camera } from "./useCanvasCamera";
import type { GalleryItem } from "./types";

function LinkRow({ item, className }: { item: GalleryItem; className: string }) {
  if (!item.instagram_url && !item.behance_url && !item.website_url) return null;
  return (
    <span className={className}>
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
  );
}

export default function WorldCanvas({
  items,
  registerSlot,
  hideImages,
  onSelect,
  onHover,
  camera,
  containerRef,
  hasInteracted,
  consumeDragFlag,
}: {
  items: GalleryItem[];
  registerSlot: (id: string, el: HTMLElement | null) => void;
  hideImages: boolean;
  onSelect: (item: GalleryItem) => void;
  onHover: (id: string | null) => void;
  camera: Camera;
  containerRef: RefObject<HTMLDivElement | null>;
  hasInteracted: boolean;
  consumeDragFlag: () => boolean;
}) {
  // The canvas replaces page scroll entirely on this route.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const [sessionSeed, setSessionSeed] = useState(0);
  useEffect(() => {
    // One-time randomize on mount, after the matching SSR/first-paint
    // render — intentionally not derivable from props/render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionSeed(Math.floor(Math.random() * 1_000_000_000));
  }, []);

  const placed = useMemo(() => layoutWorld(items, sessionSeed), [items, sessionSeed]);

  const worldStyle: CSSProperties = {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: `translate(${-camera.x * camera.zoom}px, ${-camera.y * camera.zoom}px) scale(${camera.zoom})`,
    transformOrigin: "0 0",
    willChange: "transform",
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-20 touch-none select-none"
      style={{ touchAction: "none", cursor: "grab" }}
    >
      <div style={worldStyle}>
        {placed.map(({ item, x, y, width, height }, i) => {
          const rx = nearestWrapped(x, camera.x, WORLD_SIZE);
          const ry = nearestWrapped(y, camera.y, WORLD_SIZE);
          return (
            <div key={item.id} style={{ position: "absolute", left: rx, top: ry, width, height }}>
              <button
                onClick={() => {
                  if (consumeDragFlag()) return;
                  onSelect(item);
                }}
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
                className="glitch-frame group relative block h-full w-full overflow-hidden bg-white/5 text-left transition-transform duration-300 ease-out hover:scale-[1.03]"
                style={
                  {
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
                  draggable={false}
                  className="h-full w-full object-cover grayscale transition-[opacity,filter] duration-500 ease-out group-hover:grayscale-0"
                  style={{ opacity: hideImages ? 0 : 1 }}
                />

                <span className="pointer-events-none absolute left-3 top-3 z-20 font-mono text-[10px] uppercase tracking-[0.15em] text-white/70 mix-blend-difference">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <LinkRow
                  item={item}
                  className="absolute right-3 top-3 z-20 flex gap-3 font-mono text-[10px] uppercase tracking-[0.15em] text-white/70 mix-blend-difference"
                />

                <span className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ScrambleText
                    as="span"
                    text={item.student_name}
                    className="block font-display text-xl uppercase leading-none text-white"
                  />
                  {item.title && (
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.15em] text-white/70">
                      {item.title}
                    </span>
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <CanvasIntro visible={!hasInteracted} count={items.length} />
    </div>
  );
}

function CanvasIntro({ visible, count }: { visible: boolean; count: number }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-center gap-6 px-6 text-center transition-opacity duration-700"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <p className="rotate-[-1deg] font-mono text-xs uppercase tracking-[0.3em] text-accent">
        ✦ Open call — Coventry GDMA ✦
      </p>
      <h1 className="select-none font-display uppercase leading-[0.82] text-[16vw] sm:text-[9vw]">
        <span className="block text-accent">STUDENT</span>
        <span className="block translate-x-[4vw] text-transparent [-webkit-text-stroke:2px_var(--accent-2)] sm:[-webkit-text-stroke:3px_var(--accent-2)]">
          WORK
        </span>
      </h1>
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
        {count > 0 ? `${count} piece${count === 1 ? "" : "s"} on display` : "The showcase for Graphic Design at Coventry University"}
      </p>
      <p className="mt-6 animate-pulse font-mono text-xs uppercase tracking-[0.3em] text-white/60">
        ↔ Drag to explore — scroll to zoom ↔
      </p>
    </div>
  );
}
