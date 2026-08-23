"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  // null until mounted — avoids rendering a value that might not match
  // whatever the anti-flash script already set on <html>.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Reading the value the pre-hydration script already set on <html> —
    // not derivable from props/render.
    const current = document.documentElement.getAttribute("data-theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage can throw in some privacy modes — theme just won't persist.
    }
  }

  if (!theme) return null;

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="fixed bottom-5 right-5 z-40 border border-border bg-background px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted transition hover:border-accent hover:text-accent"
    >
      {theme === "light" ? "Dark mode" : "Light mode"}
    </button>
  );
}
