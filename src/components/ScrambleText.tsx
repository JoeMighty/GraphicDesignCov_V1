"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*+";

export default function ScrambleText({
  text,
  className,
  as: Tag = "span",
  auto = false,
}: {
  text: string;
  className?: string;
  as?: "span" | "div";
  /** Also trigger the scramble on its own, at random intervals — not just on hover. */
  auto?: boolean;
}) {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scramble() {
    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      iteration += 1;
      if (iteration > text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplay(text);
      }
    }, 35);
  }

  useEffect(() => {
    if (!auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function scheduleNext() {
      const delay = 3000 + Math.random() * 5000;
      timeoutRef.current = setTimeout(() => {
        scramble();
        scheduleNext();
      }, delay);
    }
    scheduleNext();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto]);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  return (
    <Tag className={className} onMouseEnter={scramble}>
      {display}
    </Tag>
  );
}
