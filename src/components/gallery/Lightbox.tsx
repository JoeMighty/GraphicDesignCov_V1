"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GalleryItem } from "./types";

export default function Lightbox({
  item,
  onClose,
}: {
  item: GalleryItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 px-6 py-16 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-full max-w-4xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt={item.title ?? `Work by ${item.student_name}`}
              className="max-h-[65vh] w-auto object-contain"
            />
            <div className="mt-6 flex flex-col items-center gap-2 text-center">
              <p className="font-display text-2xl uppercase">{item.student_name}</p>
              {item.title && (
                <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
                  {item.title}
                </p>
              )}
              <div className="mt-2 flex gap-4 font-mono text-xs uppercase tracking-[0.15em] text-muted">
                {item.instagram_url && (
                  <a href={item.instagram_url} target="_blank" rel="noreferrer" className="hover:text-accent">
                    Instagram
                  </a>
                )}
                {item.behance_url && (
                  <a href={item.behance_url} target="_blank" rel="noreferrer" className="hover:text-accent">
                    Behance
                  </a>
                )}
                {item.website_url && (
                  <a href={item.website_url} target="_blank" rel="noreferrer" className="hover:text-accent">
                    Website
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          <button
            onClick={onClose}
            className="fixed right-6 top-6 font-mono text-xs uppercase tracking-[0.15em] text-muted transition hover:text-accent"
          >
            Close ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
