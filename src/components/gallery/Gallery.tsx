"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import GalleryGrid from "./GalleryGrid";
import Lightbox from "./Lightbox";
import { useIsEnhanced } from "./useIsEnhanced";
import { useLenisScroll } from "./useLenisScroll";
import type { GalleryItem } from "./types";

const WebGLLayer = dynamic(() => import("./WebGLLayer"), { ssr: false });

export default function Gallery({ items }: { items: GalleryItem[] }) {
  const enhanced = useIsEnhanced();
  const velocityRef = useLenisScroll(enhanced);
  const slotRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function registerSlot(id: string, el: HTMLElement | null) {
    if (el) slotRefs.current.set(id, el);
    else slotRefs.current.delete(id);
  }

  return (
    <>
      <SiteHeader />
      <main>
        <Hero count={items.length} />
        <GalleryGrid
          items={items}
          registerSlot={registerSlot}
          hideImages={enhanced}
          onSelect={setSelected}
          onHover={setHoveredId}
        />
      </main>
      {enhanced && (
        <WebGLLayer
          items={items}
          slotRefs={slotRefs}
          hoveredId={hoveredId}
          velocityRef={velocityRef}
        />
      )}
      <Lightbox item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 mix-blend-difference">
      <Link href="/" className="font-mono text-xs uppercase tracking-[0.2em]">
        GDMA Showcase
      </Link>
      <Link href="/submit" className="font-mono text-xs uppercase tracking-[0.2em] transition hover:opacity-70">
        Submit work
      </Link>
    </header>
  );
}

function Hero({ count }: { count: number }) {
  return (
    <section className="px-6 pb-16 pt-32 sm:pt-48">
      <h1 className="max-w-4xl font-display text-5xl uppercase leading-[0.92] sm:text-8xl">
        Student work,
        <br />
        out loud.
      </h1>
      <p className="mt-6 max-w-md font-mono text-xs uppercase tracking-[0.15em] text-muted">
        {count > 0
          ? `${count} piece${count === 1 ? "" : "s"} on display`
          : "The showcase for Graphic Design at Coventry University"}
      </p>
    </section>
  );
}
