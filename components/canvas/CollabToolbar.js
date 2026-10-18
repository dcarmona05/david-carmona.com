'use client';

import { STICKERS } from '@/lib/canvasSync';

const TOOLS = [
  { id: 'move', label: 'Move' },
  { id: 'frame', label: 'Frame' },
  { id: 'text', label: 'Text' },
  { id: 'pen', label: 'Pen' },
  { id: 'sticker', label: 'Sticker' },
];

/**
 * The jessa.art-style docked toolbar (Phase 3.5): move/frame/text/pen/
 * sticker tool selection, plus the aggregated "Comments · N" affordance.
 * Tools stay usable even when `isLive` is false (Firebase not configured,
 * or the Realtime Database rules haven't been deployed yet — the current
 * real state) — drawings just stay local-only to this visitor until then,
 * which this banner says plainly rather than disabling the toolbar outright.
 */
export default function CollabToolbar({
  activeTool,
  onSelectTool,
  isLive,
  commentCount,
  commentsOpen,
  onToggleComments,
  stickerPickerOpen,
  onSelectSticker,
}) {
  return (
    // Docked higher up on narrow screens so it never shares horizontal
    // space with AgentChat's bottom-right bubble — at sm+ there's enough
    // width for both side by side.
    <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
      {!isLive && (
        <p className="rounded-full bg-bg/90 border border-border/10 backdrop-blur-md px-3 py-1 text-[11px] text-fg/50 shadow-sm">
          Collaboration is offline right now — your drawings stay local to you
        </p>
      )}

      {stickerPickerOpen && (
        <div className="flex items-center gap-1 rounded-full border border-border/10 bg-bg/90 backdrop-blur-md px-2 py-1.5 shadow-lg">
          {STICKERS.map((sticker) => (
            <button
              key={sticker}
              type="button"
              onClick={() => onSelectSticker(sticker)}
              aria-label={`Place ${sticker} sticker`}
              className="w-8 h-8 flex items-center justify-center text-lg rounded-full hover:bg-surface/10 transition-colors"
            >
              {sticker}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-0.5 rounded-full border border-border/10 bg-bg/90 backdrop-blur-md px-1.5 py-1.5 shadow-lg">
        {TOOLS.map((tool) => {
          const isActive = tool.id === activeTool;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelectTool(tool.id)}
              aria-pressed={isActive}
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isActive ? 'bg-accent text-accent-ink' : 'text-fg/60 hover:text-fg hover:bg-surface/5'
              }`}
            >
              {tool.label}
            </button>
          );
        })}
        <span className="w-px h-5 bg-border/15 mx-1" />
        <button
          type="button"
          onClick={onToggleComments}
          aria-pressed={commentsOpen}
          className={`px-3 py-1.5 text-xs sm:text-sm rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            commentsOpen ? 'bg-accent text-accent-ink' : 'text-fg/60 hover:text-fg hover:bg-surface/5'
          }`}
        >
          Comments &middot; {commentCount}
        </button>
      </div>
    </div>
  );
}
