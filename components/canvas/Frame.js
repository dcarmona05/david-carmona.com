const BASE_CLASSES =
  'rounded-2xl border border-border/10 bg-bg shadow-[0_1px_2px_rgb(0_0_0_/_0.04),0_8px_24px_-8px_rgb(0_0_0_/_0.12)] p-8 sm:p-10';

/**
 * A single canvas region, in the canvas's own vertical flow (a flex column
 * with one fixed gap — see app/page.js's world div).
 *
 * Deliberately normal document flow, not absolute x/y — letting each
 * region's real rendered height determine the next region's position
 * (instead of a hand-estimated y coordinate) is what makes the canvas's
 * vertical spacing self-correct instead of needing re-guessing every time a
 * region's content changes (see CANVAS_REBUILD.md's spacing history).
 * `panToRegion` still works unchanged — it reads the frame's real
 * `getBoundingClientRect()`, not this layout mechanism.
 */
export default function Frame({ id, title, width = 640, className = '', children }) {
  const frameId = `canvas-frame-${id}`;

  return (
    <section
      id={frameId}
      data-canvas-frame={id}
      aria-label={title}
      className={`${BASE_CLASSES} w-full mx-auto ${className}`}
      style={{ maxWidth: width }}
    >
      {children}
    </section>
  );
}
