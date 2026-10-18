'use client';

import { useEffect, useRef, useState } from 'react';

const IDLE_FADE_MS = 1400;

/**
 * A small trailing "David Carmona" signature that follows the real cursor
 * around the canvas — a personal-branding touch (raised in
 * CANVAS_REBUILD.md's "raised, not designed yet" list), distinct from
 * Phase 4's PresenceCursors (which labels *other visitors'* cursors with
 * their own nickname). This one is the site owner's signature, shown
 * alongside the normal OS pointer (never replacing it — hiding the real
 * cursor site-wide would cost every link/button its native hover
 * affordance, not worth it for a decorative flourish).
 *
 * Position is driven entirely via a ref + direct style writes, not React
 * state, so a fast mouse doesn't trigger a re-render on every pixel.
 */
export default function SignatureCursor() {
  const dotRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Touch-only devices have no hovering pointer to trail — skip entirely
    // rather than leaving a stray signature stuck at the last tap position.
    const fine = window.matchMedia?.('(pointer: fine)').matches;
    setEnabled(fine ?? true);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let idleTimer;

    function onMove(event) {
      const node = dotRef.current;
      if (node) {
        node.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }
      setVisible(true);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setVisible(false), IDLE_FADE_MS);
    }

    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      clearTimeout(idleTimer);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className={`fixed top-0 left-0 z-50 pointer-events-none transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transform: 'translate3d(-9999px, -9999px, 0)' }}
    >
      <span
        className="ml-4 mt-4 inline-flex items-center gap-1.5 rounded-full border border-border/10 bg-bg/90 backdrop-blur-md pl-1.5 pr-2.5 py-1 shadow-lg whitespace-nowrap transition-transform duration-300 ease-out"
        style={{ transform: visible ? 'scale(1)' : 'scale(0.85)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
        <span className="font-display text-[11px] font-medium text-fg/70">David Carmona</span>
      </span>
    </div>
  );
}
