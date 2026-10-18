'use client';

/**
 * Other visitors' live cursors (Phase 4) — rendered in the same world-space
 * coordinates as the canvas Frames/collab elements, so they pan and zoom
 * correctly with the camera. `others` is the presence map minus this
 * visitor's own entry (already filtered by lib/presence.js).
 */
export default function PresenceCursors({ others }) {
  return (
    <>
      {Object.entries(others).map(([uid, visitor]) => {
        if (typeof visitor?.cursor?.x !== 'number' || typeof visitor?.cursor?.y !== 'number') return null;
        return (
          <div
            key={uid}
            className="absolute pointer-events-none transition-[left,top] duration-150 ease-out z-10"
            style={{ left: visitor.cursor.x, top: visitor.cursor.y }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 2L18 9L10 11L8 18L2 2Z"
                fill={visitor.color || '#FF3D81'}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            <span
              className="ml-4 -mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium text-white whitespace-nowrap shadow"
              style={{ backgroundColor: visitor.color || '#FF3D81' }}
            >
              {visitor.nickname || 'Someone'}
            </span>
          </div>
        );
      })}
    </>
  );
}
