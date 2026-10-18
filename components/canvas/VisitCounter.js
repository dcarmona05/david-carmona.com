'use client';

/**
 * A running visit counter (Phase 4) — small, unobtrusive, sits just under
 * the visitor-avatar stack.
 */
export default function VisitCounter({ count }) {
  if (!count) return null;

  return (
    // Same mobile collision reasoning as VisitorAvatars just above it.
    <div className="hidden sm:block fixed top-32 left-4 z-40 text-xs text-fg/50 bg-bg/80 backdrop-blur-sm rounded-full px-2.5 py-1 border border-border/10">
      👀 {count.toLocaleString()} visit{count === 1 ? '' : 's'}
    </div>
  );
}
