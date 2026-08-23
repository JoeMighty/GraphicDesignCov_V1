"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import GalleryGrid from "./GalleryGrid";
import Lightbox from "./Lightbox";
import ScrambleText from "@/components/ScrambleText";
import IntroLoader from "@/components/IntroLoader";
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
      <IntroLoader />
      <SiteHeader />
      <main>
        <Hero count={items.length} />
        <Marquee />
        <GalleryGrid
          items={items}
          registerSlot={registerSlot}
          hideImages={enhanced}
          onSelect={setSelected}
          onHover={setHoveredId}
        />
        <SubmitCta />
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
    <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 mix-blend-difference">
      <Link href="/">
        <ScrambleText text="GDMA SHOWCASE" className="font-mono text-xs uppercase tracking-[0.2em]" />
      </Link>
      <Link href="/submit">
        <ScrambleText text="SUBMIT WORK →" className="font-mono text-xs uppercase tracking-[0.2em]" />
      </Link>
    </header>
  );
}

function Hero({ count }: { count: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useTransform(y, [-200, 200], [6, -6]);
  const ry = useTransform(x, [-200, 200], [-6, 6]);

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  return (
    <section onMouseMove={onMouseMove} className="relative overflow-hidden px-6 pb-24 pt-40 sm:pt-56">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rotate-[-1deg] font-mono text-xs uppercase tracking-[0.3em] text-accent"
      >
        ✦ Open call — Coventry GDMA ✦
      </motion.p>

      <motion.h1
        style={{ rotateX: rx, rotateY: ry }}
        className="select-none font-display uppercase leading-[0.78] text-[19vw] sm:text-[12vw]"
      >
        <ScrambleText as="div" text="STUDENT" className="mt-6 block text-accent" />
        <ScrambleText
          as="div"
          text="WORK"
          className="-mt-[0.12em] block translate-x-[6vw] text-transparent [-webkit-text-stroke:2px_var(--accent-2)] sm:[-webkit-text-stroke:3px_var(--accent-2)]"
        />
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-10 max-w-md font-mono text-xs uppercase tracking-[0.15em] text-muted"
      >
        {count > 0
          ? `${count} piece${count === 1 ? "" : "s"} on display`
          : "The showcase for Graphic Design at Coventry University"}
      </motion.p>
    </section>
  );
}

function SubmitCta() {
  return (
    <section className="border-t border-border px-6 py-24 sm:py-40">
      <Link href="/submit" className="group block">
        <span className="block font-display uppercase leading-[0.85] text-[15vw] transition-colors duration-300 group-hover:text-accent sm:text-[9vw]">
          <ScrambleText as="span" text="CLICK TO" className="block" />
          <ScrambleText as="span" text="SUBMIT →" className="block" />
        </span>
      </Link>

      <div className="mt-12 flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.15em] text-muted sm:flex-row sm:gap-10">
        <span>{`// status: open for submissions`}</span>
        <span>[reviewed by GDMA staff before publishing]</span>
        <span>[optimise your file before upload]</span>
      </div>
    </section>
  );
}

function Marquee() {
  const text = "OPEN CALL — SUBMIT YOUR WORK — COVENTRY GDMA — ";
  return (
    <div className="relative -my-2 origin-center -skew-y-1 overflow-hidden border-y-2 border-accent-2 bg-foreground/[0.03] py-3">
      <div className="animate-marquee flex w-max gap-8 whitespace-nowrap font-display text-2xl uppercase text-accent-2 sm:text-4xl">
        <span>{text.repeat(6)}</span>
        <span>{text.repeat(6)}</span>
      </div>
    </div>
  );
}
