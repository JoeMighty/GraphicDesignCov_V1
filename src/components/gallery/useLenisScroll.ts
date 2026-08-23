"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * Initializes Lenis smooth scroll when enabled, and returns a mutable ref
 * tracking current scroll velocity (read each frame by the WebGL layer,
 * not via React state, to avoid re-renders on every scroll tick).
 */
export function useLenisScroll(enabled: boolean) {
  const velocityRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });

    lenis.on("scroll", (l: Lenis) => {
      velocityRef.current = l.velocity;
    });

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [enabled]);

  return velocityRef;
}
