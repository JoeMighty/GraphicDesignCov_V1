"use client";

import { useEffect, useState } from "react";

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Whether the full WebGL-driven gallery should render, vs the plain CSS
 * fallback grid. Disabled on narrow/touch viewports, reduced-motion
 * preference, or if WebGL isn't available.
 */
export function useIsEnhanced() {
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isNarrow = window.innerWidth < 768;
    // Capability check can only run client-side; this is a one-time read on
    // mount, not state derived from props/other state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnhanced(!prefersReducedMotion && !isNarrow && hasWebGL());
  }, []);

  return enhanced;
}
