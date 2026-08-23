"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

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

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      className={`pointer-events-none fixed left-0 top-0 z-50 rounded-full bg-white mix-blend-difference transition-[width,height] duration-150 ease-out ${
        active ? "h-10 w-10" : "h-3 w-3"
      }`}
    />
  );
}
