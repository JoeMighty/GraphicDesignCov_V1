"use client";

import { useEffect, useState } from "react";

// Module-scoped, not state: persists across client-side navigations within
// the same page load so the loader only plays once per visit, not every
// time the gallery remounts.
let hasPlayedIntro = false;

export default function IntroLoader() {
  const [visible, setVisible] = useState(!hasPlayedIntro);
  const [percent, setPercent] = useState(0);
  const [wiping, setWiping] = useState(false);

  useEffect(() => {
    if (hasPlayedIntro) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      hasPlayedIntro = true;
      // Skipping the animation entirely for reduced-motion users, in an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
      return;
    }

    let raf: number;
    const start = performance.now();
    const duration = 1000;

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      setPercent(Math.round(t * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        hasPlayedIntro = true;
        setWiping(true);
        setTimeout(() => setVisible(false), 650);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background transition-transform duration-[650ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
      style={{ transform: wiping ? "translateY(-100%)" : "translateY(0)" }}
    >
      <span className="font-display text-4xl uppercase tracking-tight sm:text-6xl">GDMA</span>
      <div className="h-px w-32 overflow-hidden bg-border">
        <div
          className="h-full bg-accent-2 transition-[width] duration-100 ease-linear"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted">{percent}%</span>
    </div>
  );
}
