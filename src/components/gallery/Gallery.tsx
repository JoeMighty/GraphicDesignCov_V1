"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ScrambleText from "@/components/ScrambleText";
import IntroLoader from "@/components/IntroLoader";
import WorldCanvas from "./WorldCanvas";
import Lightbox from "./Lightbox";
import { useCanvasCamera } from "./useCanvasCamera";
import { useIsEnhanced } from "./useIsEnhanced";
import type { GalleryItem } from "./types";

const WebGLLayer = dynamic(() => import("./WebGLLayer"), { ssr: false });

export default function Gallery({ items }: { items: GalleryItem[] }) {
  const enhanced = useIsEnhanced();
  const { camera, containerRef, hasInteracted, consumeDragFlag, panVelocityRef } = useCanvasCamera();
  const slotRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function registerSlot(id: string, el: HTMLElement | null) {
    if (el) slotRefs.current.set(id, el);
    else slotRefs.current.delete(id);
  }

  return (
    <>
      <IntroLoader />
      <SiteHeader />
      <WorldCanvas
        items={items}
        registerSlot={registerSlot}
        hideImages={enhanced}
        onSelect={setSelected}
        onHover={setHoveredId}
        camera={camera}
        containerRef={containerRef}
        hasInteracted={hasInteracted}
        consumeDragFlag={consumeDragFlag}
      />
      {enhanced && (
        <WebGLLayer
          items={items}
          slotRefs={slotRefs}
          hoveredId={hoveredId}
          velocityRef={panVelocityRef}
        />
      )}
      <Lightbox item={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 mix-blend-difference">
      <Link href="/">
        <ScrambleText text="GDMA SHOWCASE" className="font-mono text-xs uppercase tracking-[0.2em]" />
      </Link>
      <Link href="/submit">
        <ScrambleText text="SUBMIT WORK →" className="font-mono text-xs uppercase tracking-[0.2em]" />
      </Link>
    </header>
  );
}
