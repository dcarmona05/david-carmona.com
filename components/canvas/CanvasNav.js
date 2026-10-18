'use client';

/**
 * Docked camera control for the canvas (Phase 3) — the thing that actually
 * "pans the camera between regions instead of loading pages." Docked at
 * the top, where primary navigation normally lives — the global Header's
 * own Work/About/Contact nav is hidden on this page specifically (see
 * Header.js) since this is the same navigation, just front and center,
 * rather than two navs doing the same job in two places.
 */
export default function CanvasNav({ regions, active, onNavigate }) {
  return (
    <nav
      aria-label="Canvas regions"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-0.5 sm:gap-1 rounded-full border border-border/10 bg-bg/90 backdrop-blur-md px-1.5 py-1.5 sm:px-2 sm:py-2 shadow-lg max-w-[calc(100vw-2rem)] overflow-x-auto"
    >
      {regions.map((region) => {
        const isActive = region.id === active;
        return (
          <button
            key={region.id}
            type="button"
            onClick={() => onNavigate(region.id)}
            aria-current={isActive ? 'true' : undefined}
            className={`shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isActive
                ? 'bg-accent text-accent-ink'
                : 'text-fg/60 hover:text-fg hover:bg-surface/5'
            }`}
          >
            {region.label}
          </button>
        );
      })}
    </nav>
  );
}
