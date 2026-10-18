'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ScreenshotGallery({ screenshots }) {
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    if (openIndex === null) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpenIndex(null);
      if (e.key === 'ArrowRight') setOpenIndex((i) => (i + 1) % screenshots.length);
      if (e.key === 'ArrowLeft') setOpenIndex((i) => (i - 1 + screenshots.length) % screenshots.length);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openIndex, screenshots]);

  if (!screenshots || screenshots.length === 0) return null;

  const active = openIndex !== null ? screenshots[openIndex] : null;

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {screenshots.map((shot, i) => (
          <figure
            key={i}
            className="rounded-lg border border-border/10 overflow-hidden bg-surface/[0.02] hover:border-border/25 transition-colors"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`View larger: ${shot.caption || shot.alt}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shot.src} alt={shot.alt} className="w-full h-auto cursor-zoom-in" loading="lazy" />
            </button>
            <figcaption className="px-4 py-3 text-sm text-fg/50 border-t border-border/10">
              {shot.caption || shot.alt}
            </figcaption>
          </figure>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-label={active.caption || active.alt}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 sm:p-10"
            onClick={() => setOpenIndex(null)}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label="Close"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {screenshots.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIndex((openIndex - 1 + screenshots.length) % screenshots.length);
                  }}
                  aria-label="Previous screenshot"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIndex((openIndex + 1) % screenshots.length);
                  }}
                  aria-label="Next screenshot"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.src}
              alt={active.alt}
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="mt-4 text-sm text-white/60 max-w-xl text-center">{active.caption || active.alt}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
