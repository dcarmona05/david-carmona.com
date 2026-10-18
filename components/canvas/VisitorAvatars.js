'use client';

const MAX_SHOWN = 5;

/**
 * A small avatar-stack of currently-present visitors (Phase 4), the
 * jessa.art-style "who else is here" affordance. `others` is the presence
 * map minus this visitor's own entry; `mine` (this visitor's own nickname/
 * color) is always shown first so the cluster never reads as empty just
 * because no one else happens to be online right now.
 */
export default function VisitorAvatars({ others, mine }) {
  const visitors = Object.values(others || {});
  const total = visitors.length + 1; // + this visitor
  const shown = [mine, ...visitors].slice(0, MAX_SHOWN);
  const overflow = total - shown.length;

  return (
    // Hidden below sm: the offline-banner + toolbar cluster already fills
    // the top of a narrow viewport (see CollabToolbar) — no room left for
    // this too without colliding, and it's a nice-to-have, not essential.
    <div className="hidden sm:flex fixed top-20 left-4 z-40 items-center -space-x-2">
      {shown.map((visitor, i) => (
        <div
          key={i}
          title={visitor?.nickname || 'Someone'}
          className="w-8 h-8 rounded-full border-2 border-bg flex items-center justify-center text-[10px] font-bold text-white shadow"
          style={{ backgroundColor: visitor?.color || '#FF3D81' }}
        >
          {(visitor?.nickname || '?').charAt(0)}
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-bg bg-surface/20 flex items-center justify-center text-[10px] font-medium text-fg/70 shadow">
          +{overflow}
        </div>
      )}
    </div>
  );
}
