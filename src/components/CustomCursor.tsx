"use client";

import { useEffect, useRef, useState } from "react";
import { onCursorLabel } from "@/lib/cursorSignal";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || prefersReducedMotion) return;

    // Device capability check can only run client-side, on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    function onMove(e: MouseEvent) {
      const el = dotRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    }

    function onOver(e: MouseEvent) {
      const target = e.target as HTMLElement;
      setActive(!!target.closest("a, button, [role='button']"));
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    const offLabel = onCursorLabel(setLabel);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      offLabel();
    };
  }, []);

  if (!enabled) return null;

  const size = label ? "h-24 w-24" : active ? "h-10 w-10" : "h-3 w-3";

  return (
    <div
      ref={dotRef}
      className={`pointer-events-none fixed left-0 top-0 z-50 flex items-center justify-center rounded-full bg-white mix-blend-difference transition-[width,height] duration-200 ease-out ${size}`}
    >
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black">
          {label}
        </span>
      )}
    </div>
  );
}
