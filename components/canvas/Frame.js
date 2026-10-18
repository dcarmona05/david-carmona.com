const BASE_CLASSES =
  'rounded-2xl border border-border/10 bg-bg shadow-[0_1px_2px_rgb(0_0_0_/_0.04),0_8px_24px_-8px_rgb(0_0_0_/_0.12)] p-8 sm:p-10';

/**
 * A single canvas region. Renders the exact same content and markup whether
 * it's absolutely positioned inside the transformed canvas (`stacked=false`,
 * the default) or stacked in plain linear document flow for the no-JS /
 * reduced-capability fallback (`stacked=true`) — same component, different
 * outer layout, per CANVAS_REBUILD.md's accessibility fallback plan.
 */
export default function Frame({
  id,
  title,
  x = 0,
  y = 0,
  width = 640,
  stacked = false,
  className = '',
  children,
}) {
  const frameId = `canvas-frame-${id}`;

  if (stacked) {
    return (
      <section
        id={frameId}
        data-canvas-frame={id}
        aria-label={title}
        className={`${BASE_CLASSES} w-full max-w-2xl mx-auto ${className}`}
      >
        {children}
      </section>
    );
  }

  return (
    <section
      id={frameId}
      data-canvas-frame={id}
      aria-label={title}
      className={`absolute ${BASE_CLASSES} ${className}`}
      style={{ left: x, top: y, width }}
    >
      {children}
    </section>
  );
}
