'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  subscribeToElements,
  subscribeToPins,
  createElement,
  deleteElement,
  togglePin,
  countPins,
  isElementExpired,
  loadLocalElements,
  saveLocalElements,
  MAX_PEN_POINTS,
  MAX_TEXT_LENGTH,
  TEXT_SIZES,
  TEXT_FONTS,
} from '@/lib/canvasSync';
import { getIdentity, IDENTITY_COLORS } from '@/lib/identity';
import { ensureAnonymousAuth } from '@/lib/firebase';

const OWNER_UID = process.env.NEXT_PUBLIC_CANVAS_OWNER_UID || null;
const PEN_MIN_POINT_DISTANCE = 4;
const MIN_FRAME_SIZE = { width: 80, height: 60 };

function pointsToPath(points) {
  if (!points?.length) return '';
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
}

function textSizeClass(id) {
  return TEXT_SIZES.find((s) => s.id === id)?.className || TEXT_SIZES[1].className;
}

function textFontClass(id) {
  return TEXT_FONTS.find((f) => f.id === id)?.className || TEXT_FONTS[0].className;
}

// Shared by both the frame "label it" popover and the text tool's style
// popover — a small swatch row reusing the fixed 6-color identity palette
// (lib/identity.js), deliberately not a freeform color picker (see
// CANVAS_REBUILD.md's moderation design rationale).
function ColorSwatches({ value, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      {IDENTITY_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={`Color ${c}`}
          aria-pressed={value === c}
          className={`w-5 h-5 rounded-full ring-2 ring-offset-2 ring-offset-bg transition-shadow ${
            value === c ? 'ring-fg' : 'ring-transparent'
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function SegmentedPicker({ options, value, onChange, labelPrefix }) {
  return (
    <div className="flex items-center gap-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          aria-label={`${labelPrefix} ${opt.label}`}
          aria-pressed={value === opt.id}
          className={`px-2 py-1 text-[11px] rounded-md border transition-colors ${
            value === opt.id
              ? 'border-accent bg-accent/10 text-fg'
              : 'border-border/15 text-fg/50 hover:text-fg'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Renders every shared canvas element (frame/text/pen/sticker — Phase 3.5)
 * in world-space, inside the same transformed content div as the Frame
 * regions, and owns the create-tool interactions. Exposes pointer handlers
 * via ref so CanvasStage can forward already-world-space-converted pointer
 * events into it while a create-tool is active.
 */
const CollabLayer = forwardRef(function CollabLayer(
  { activeTool, pendingSticker, onStickerPlaced, onLiveStatusChange },
  ref
) {
  const [remoteElements, setRemoteElements] = useState({});
  const [localElements, setLocalElements] = useState({});
  const [pins, setPins] = useState({});
  // Real bug caught while testing: togglePin needs `myUid`, which is null
  // whenever Firebase auth fails (the actual current state) -- without
  // this, `isPinnedByMe` could never become true and clicking Pin would
  // silently do nothing, unlike every other tool here, which all have a
  // local-optimistic fallback. This is that fallback for pins.
  const [localPinIds, setLocalPinIds] = useState(() => new Set());
  const [myUid, setMyUid] = useState(null);
  // Text tool: click-to-place, with its style options in the same step.
  const [textDraft, setTextDraft] = useState(null); // { x, y, text, color, size, font }
  // Frame tool: draw-to-size first ('drawing'), then a label/color step
  // ('editing') -- per David's explicit ask, not naming it before it's drawn.
  const [frameDraft, setFrameDraft] = useState(null);
  const [stickerGhost, setStickerGhost] = useState(null); // { x, y } — follows the cursor pre-placement
  const [drawingId, setDrawingId] = useState(null);
  const identityRef = useRef(null);
  const hydratedLocalRef = useRef(false);

  useEffect(() => {
    identityRef.current = getIdentity();
    ensureAnonymousAuth().then(setMyUid);
  }, []);

  // Load this browser's own not-yet-synced elements after mount (not in a
  // lazy useState initializer) -- reading localStorage during the client's
  // first render would disagree with the server's always-empty render, the
  // same hydration-mismatch class of bug already documented for presence
  // identity. Safe to merge in after mount since this is strictly additive.
  useEffect(() => {
    const cached = loadLocalElements();
    if (Object.keys(cached).length) {
      setLocalElements((prev) => ({ ...cached, ...prev }));
    }
    hydratedLocalRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedLocalRef.current) return;
    saveLocalElements(localElements);
  }, [localElements]);

  useEffect(() => {
    const unsub = subscribeToElements(({ status, items }) => {
      onLiveStatusChange?.(status === 'connected');
      setRemoteElements(items || {});
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => subscribeToPins(({ items }) => setPins(items || {})), []);

  const commitLocal = useCallback(async (tempId, payload) => {
    const identity = identityRef.current || getIdentity();
    const result = await createElement({
      ...payload,
      authorNickname: identity.nickname,
    });
    if (result.ok && result.id) {
      // Once it's really synced, the remote subscription will deliver it
      // under its real id -- drop the local-only copy entirely instead of
      // re-keying it, so it doesn't linger forever as dead state (and dead
      // localStorage weight) once Firebase is actually reachable.
      setLocalElements((prev) => {
        if (!(tempId in prev)) return prev;
        const next = { ...prev };
        delete next[tempId];
        return next;
      });
    }
  }, []);

  const placeElement = useCallback(
    (payload) => {
      const identity = identityRef.current || getIdentity();
      const withColor = { color: identity.color, ...payload };
      const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setLocalElements((prev) => ({ ...prev, [tempId]: withColor }));
      commitLocal(tempId, withColor);
    },
    [commitLocal]
  );

  // --- Pointer handlers, wired by the parent into CanvasStage's
  // onCanvasPointerDown/Move/Up while a create-tool is active ---

  const handlePointerDown = useCallback(
    ({ x, y }) => {
      if (activeTool === 'frame') {
        // Only start a new box if one isn't already being drawn/labeled --
        // the in-progress one has to be confirmed or cancelled first.
        setFrameDraft((prev) => prev ?? { phase: 'drawing', startX: x, startY: y, x, y, width: 0, height: 0 });
        return;
      }
      if (activeTool === 'text') {
        const identity = identityRef.current || getIdentity();
        setTextDraft((prev) => prev ?? { x, y, text: '', color: identity.color, size: 'md', font: 'sans' });
        return;
      }
      if (activeTool === 'sticker' && pendingSticker) {
        placeElement({ type: 'sticker', stickerId: pendingSticker, x, y });
        setStickerGhost(null);
        onStickerPlaced?.();
        return;
      }
      if (activeTool === 'pen') {
        const id = `drawing-${Date.now()}`;
        setDrawingId(id);
        setLocalElements((prev) => ({
          ...prev,
          [id]: { type: 'pen', points: [[x, y]], color: identityRef.current?.color, _inProgress: true },
        }));
      }
    },
    [activeTool, pendingSticker, placeElement, onStickerPlaced]
  );

  const handlePointerMove = useCallback(
    ({ x, y }) => {
      if (activeTool === 'pen' && drawingId) {
        setLocalElements((prev) => {
          const current = prev[drawingId];
          if (!current) return prev;
          const points = current.points;
          const last = points[points.length - 1];
          const dx = x - last[0];
          const dy = y - last[1];
          if (Math.sqrt(dx * dx + dy * dy) < PEN_MIN_POINT_DISTANCE) return prev;
          if (points.length >= MAX_PEN_POINTS) return prev;
          return { ...prev, [drawingId]: { ...current, points: [...points, [x, y]] } };
        });
        return;
      }
      if (activeTool === 'frame') {
        setFrameDraft((prev) => {
          if (!prev || prev.phase !== 'drawing') return prev;
          const x0 = Math.min(prev.startX, x);
          const y0 = Math.min(prev.startY, y);
          return { ...prev, x: x0, y: y0, width: Math.abs(x - prev.startX), height: Math.abs(y - prev.startY) };
        });
        return;
      }
      if (activeTool === 'sticker' && pendingSticker) {
        setStickerGhost({ x, y });
      }
    },
    [activeTool, drawingId, pendingSticker]
  );

  const handlePointerUp = useCallback(() => {
    if (activeTool === 'pen' && drawingId) {
      const id = drawingId;
      setDrawingId(null);
      setLocalElements((prev) => {
        const stroke = prev[id];
        if (!stroke) return prev;
        if (stroke.points.length < 2) {
          const next = { ...prev };
          delete next[id];
          return next;
        }
        const { _inProgress, ...payload } = stroke;
        commitLocal(id, payload);
        return { ...prev, [id]: payload };
      });
      return;
    }
    if (activeTool === 'frame') {
      setFrameDraft((prev) => {
        if (!prev || prev.phase !== 'drawing') return prev;
        // Enforce a minimum box size (a bare click, with no drag, lands
        // here too) without moving its anchor corner.
        return {
          ...prev,
          width: Math.max(prev.width, MIN_FRAME_SIZE.width),
          height: Math.max(prev.height, MIN_FRAME_SIZE.height),
          phase: 'editing',
          text: '',
          color: identityRef.current?.color,
        };
      });
    }
  }, [activeTool, drawingId, commitLocal]);

  useImperativeHandle(ref, () => ({ handlePointerDown, handlePointerMove, handlePointerUp }), [
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  ]);

  // Safety net: if the pointer is released outside the canvas wrapper while
  // mid-stroke, still commit (or discard) the stroke instead of leaving it
  // stuck "drawing" forever.
  useEffect(() => {
    if (!drawingId) return undefined;
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [drawingId, handlePointerUp]);

  function commitTextDraft() {
    if (!textDraft) return;
    const text = textDraft.text.trim().slice(0, MAX_TEXT_LENGTH);
    if (!text) {
      setTextDraft(null);
      return;
    }
    placeElement({
      type: 'text',
      x: textDraft.x,
      y: textDraft.y,
      text,
      color: textDraft.color,
      fontSize: textDraft.size,
      fontFamily: textDraft.font,
    });
    setTextDraft(null);
  }

  function commitFrameDraft() {
    if (!frameDraft) return;
    const text = frameDraft.text.trim().slice(0, MAX_TEXT_LENGTH);
    placeElement({
      type: 'frame',
      x: frameDraft.x,
      y: frameDraft.y,
      width: frameDraft.width,
      height: frameDraft.height,
      text,
      color: frameDraft.color,
    });
    setFrameDraft(null);
  }

  async function handlePin(id, isPinnedByMe) {
    setLocalPinIds((prev) => {
      const next = new Set(prev);
      if (isPinnedByMe) next.delete(id);
      else next.add(id);
      return next;
    });
    await togglePin(id, isPinnedByMe);
  }

  async function handleDelete(id) {
    // A still-local-only element (never reached Firebase — e.g.
    // collaboration is offline right now) has nothing to delete remotely;
    // just drop it from local state instead.
    if (id in localElements) {
      setLocalElements((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    await deleteElement(id);
  }

  const merged = { ...localElements, ...remoteElements };
  // Never trust a remote element's shape blindly, even with RTDB rules in
  // place — a single malformed write (a 'pen' with no points, a type the
  // client doesn't know) would otherwise crash this render for every
  // visitor, not just whoever wrote it.
  const entries = Object.entries(merged).filter(([id, el]) => {
    if (el.type === 'pen') {
      if (!Array.isArray(el.points) || el.points.length < 2) return false;
    } else if (el.type === 'frame') {
      if (typeof el.x !== 'number' || typeof el.y !== 'number') return false;
    } else if (el.type === 'text') {
      if (typeof el.x !== 'number' || typeof el.y !== 'number' || typeof el.text !== 'string') return false;
    } else if (el.type === 'sticker') {
      if (typeof el.x !== 'number' || typeof el.y !== 'number' || typeof el.stickerId !== 'string') return false;
    } else {
      return false;
    }
    // Daily clear: an element older than a day hides itself unless pinned
    // (lib/canvasSync.js's isElementExpired) -- comments are a separate
    // tree/component and untouched by this.
    const isPinnedByMe = localPinIds.has(id) || !!(myUid && pins[id]?.[myUid]);
    const isPinned = isPinnedByMe || countPins(pins, id) > 0;
    return !isElementExpired(el, isPinned);
  });

  return (
    <>
      {entries.map(([id, el]) => {
        const isPinnedByMe = localPinIds.has(id) || !!(myUid && pins[id]?.[myUid]);
        const isPinned = isPinnedByMe || countPins(pins, id) > 0;
        // A not-yet-synced element only exists in this visitor's own
        // browser, so they can always delete it regardless of auth state —
        // there's nothing shared yet to need a permission check for.
        const isLocalOnly = id in localElements && !(id in remoteElements);
        const canModerate = isLocalOnly || (myUid && (myUid === el.authorUid || myUid === OWNER_UID));

        if (el.type === 'pen') {
          const xs = el.points.map((p) => p[0]);
          const ys = el.points.map((p) => p[1]);
          const minX = Math.min(...xs) - 10;
          const minY = Math.min(...ys) - 10;
          const w = Math.max(...xs) - minX + 20;
          const h = Math.max(...ys) - minY + 20;
          const strokePath = pointsToPath(el.points.map(([x, y]) => [x - minX, y - minY]));
          return (
            // Real bug David found: this wrapper had no pointer-events
            // setting, so its default "auto" made the drawing's whole
            // bounding box (often much larger than the actual ink, since a
            // loose scribble's rectangle spans everything between its
            // farthest points) swallow every click underneath it -- a
            // button or link behind a scribble became unreachable, not
            // just the thin line itself. pointer-events-none here, with
            // only the stroke's own hit-area and the control pill opting
            // back in below, means only the ink itself (plus a little
            // slop for easy targeting) and the pill are ever clickable.
            <div key={id} className="group absolute pointer-events-none" style={{ left: minX, top: minY, width: w, height: h }}>
              <svg width={w} height={h} className="overflow-visible">
                {/* Invisible, wider hit-path -- hover/click target follows
                    the actual drawn line instead of the bounding box, so
                    real content between strands of a loose scribble stays
                    reachable. Also what makes the stroke hoverable at all
                    now that the wrapper itself is pointer-events-none --
                    hovering it is what reveals the pill below, same as
                    hovering the wrapper used to. */}
                <path
                  d={strokePath}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={16}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                />
                <path
                  d={strokePath}
                  fill="none"
                  stroke={el.color || '#FF3D81'}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ pointerEvents: 'none' }}
                />
              </svg>
              {/* Redesigned per feedback: the old pair of bare circular
                  icons overlapping the stroke's own corner read as stray
                  floating dots on a thin line with nothing to anchor to.
                  One pill, with a real background/shadow, sitting just
                  outside the stroke's bounding box instead of on top of
                  it, reads as a control instead. */}
              <div
                className="absolute flex items-center gap-1 rounded-full bg-bg border border-border/15 shadow-lg px-1 py-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity pointer-events-auto"
                style={{ left: w + 6, top: Math.max(h - 28, 0) }}
              >
                {canModerate && (
                  <button
                    type="button"
                    onClick={() => handleDelete(id)}
                    aria-label="Delete drawing"
                    title="Delete"
                    className="w-6 h-6 rounded-full text-xs text-fg/70 hover:bg-surface/10 hover:text-accent flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handlePin(id, isPinnedByMe)}
                  aria-label={isPinnedByMe ? 'Unpin drawing' : 'Pin drawing'}
                  aria-pressed={isPinned}
                  title={isPinnedByMe ? 'Unpin' : 'Pin'}
                  className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                    isPinned ? 'text-accent' : 'text-fg/70 hover:bg-surface/10 hover:text-accent'
                  }`}
                >
                  📌
                </button>
              </div>
            </div>
          );
        }

        const controls = (
          <span className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            {canModerate && (
              <button
                type="button"
                onClick={() => handleDelete(id)}
                aria-label="Delete"
                className="w-5 h-5 rounded-full bg-bg border border-border/20 text-[10px] text-fg/70 hover:text-accent flex items-center justify-center shadow"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              onClick={() => handlePin(id, isPinnedByMe)}
              aria-label={isPinnedByMe ? 'Unpin' : 'Pin'}
              aria-pressed={isPinned}
              title={isPinnedByMe ? 'Unpin' : 'Pin'}
              className={`w-5 h-5 rounded-full bg-bg border text-[10px] flex items-center justify-center shadow ${
                isPinned ? 'border-accent text-accent' : 'border-border/20 text-fg/70 hover:text-accent'
              }`}
            >
              📌
            </button>
          </span>
        );

        if (el.type === 'sticker') {
          return (
            <div
              key={id}
              className="group absolute text-3xl select-none"
              style={{ left: el.x - 18, top: el.y - 18 }}
              title={`${el.authorNickname || 'Someone'}'s sticker`}
            >
              {el.stickerId}
              {controls}
            </div>
          );
        }

        if (el.type === 'frame') {
          return (
            <div
              key={id}
              className="group absolute rounded-lg border-2 border-dashed pointer-events-none"
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                borderColor: el.color || '#FF3D81',
              }}
            >
              {el.text && (
                <span className="absolute -top-6 left-0 text-xs font-medium px-1" style={{ color: el.color }}>
                  {el.text}
                </span>
              )}
              <span className="pointer-events-auto">{controls}</span>
            </div>
          );
        }

        // text
        return (
          <div
            key={id}
            className={`group absolute max-w-[220px] font-medium px-2 py-1 rounded bg-bg/80 border ${textSizeClass(
              el.fontSize
            )} ${textFontClass(el.fontFamily)}`}
            style={{ left: el.x, top: el.y, borderColor: el.color, color: el.color }}
          >
            {el.text}
            {controls}
          </div>
        );
      })}

      {/* Frame tool: the box itself while being dragged to size (no label
          yet — drawn first, named after, per David's explicit ask). */}
      {frameDraft?.phase === 'drawing' && (
        <div
          className="absolute rounded-lg border-2 border-dashed pointer-events-none"
          style={{
            left: frameDraft.x,
            top: frameDraft.y,
            width: frameDraft.width,
            height: frameDraft.height,
            borderColor: identityRef.current?.color || '#FF3D81',
          }}
        />
      )}

      {/* Frame tool: now that it's sized, a chance to label and color it
          before it's actually placed. */}
      {frameDraft?.phase === 'editing' && (
        <>
          <div
            className="absolute rounded-lg border-2 border-dashed pointer-events-none"
            style={{
              left: frameDraft.x,
              top: frameDraft.y,
              width: frameDraft.width,
              height: frameDraft.height,
              borderColor: frameDraft.color,
            }}
          />
          <div
            className="absolute z-10 w-64 rounded-lg border border-border/10 bg-bg p-3 shadow-xl space-y-2.5"
            style={{ left: frameDraft.x, top: frameDraft.y + frameDraft.height + 8 }}
          >
            <input
              autoFocus
              type="text"
              value={frameDraft.text}
              maxLength={MAX_TEXT_LENGTH}
              placeholder="Label this frame… (optional)"
              onChange={(e) => setFrameDraft((d) => ({ ...d, text: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitFrameDraft();
                if (e.key === 'Escape') setFrameDraft(null);
              }}
              className="w-full rounded-md border border-border/15 bg-surface/5 px-2 py-1.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <ColorSwatches value={frameDraft.color} onChange={(color) => setFrameDraft((d) => ({ ...d, color }))} />
            <div className="flex justify-end gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setFrameDraft(null)}
                className="text-xs text-fg/50 hover:text-fg px-2 py-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={commitFrameDraft}
                className="text-xs font-medium rounded-md bg-accent text-accent-ink px-3 py-1.5 hover:scale-[1.03] transition-transform"
              >
                Add frame
              </button>
            </div>
          </div>
        </>
      )}

      {/* Sticker tool: a translucent preview of the selected sticker
          following the cursor before it's actually placed. */}
      {activeTool === 'sticker' && pendingSticker && stickerGhost && (
        <div
          className="absolute text-3xl select-none pointer-events-none opacity-50"
          style={{ left: stickerGhost.x - 18, top: stickerGhost.y - 18 }}
        >
          {pendingSticker}
        </div>
      )}

      {textDraft && (
        <div
          className="absolute z-10 w-64 rounded-lg border border-border/10 bg-bg p-3 shadow-xl space-y-2.5"
          style={{ left: textDraft.x, top: textDraft.y }}
        >
          <input
            autoFocus
            type="text"
            value={textDraft.text}
            maxLength={MAX_TEXT_LENGTH}
            placeholder="Say something…"
            onChange={(e) => setTextDraft((d) => ({ ...d, text: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTextDraft();
              if (e.key === 'Escape') setTextDraft(null);
            }}
            className="w-full rounded-md border border-border/15 bg-surface/5 px-2 py-1.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <ColorSwatches value={textDraft.color} onChange={(color) => setTextDraft((d) => ({ ...d, color }))} />
          <SegmentedPicker
            options={TEXT_SIZES}
            value={textDraft.size}
            onChange={(size) => setTextDraft((d) => ({ ...d, size }))}
            labelPrefix="Size"
          />
          <SegmentedPicker
            options={TEXT_FONTS}
            value={textDraft.font}
            onChange={(font) => setTextDraft((d) => ({ ...d, font }))}
            labelPrefix="Font"
          />
          <div className="flex justify-end gap-2 pt-0.5">
            <button type="button" onClick={() => setTextDraft(null)} className="text-xs text-fg/50 hover:text-fg px-2 py-1">
              Cancel
            </button>
            <button
              type="button"
              onClick={commitTextDraft}
              className="text-xs font-medium rounded-md bg-accent text-accent-ink px-3 py-1.5 hover:scale-[1.03] transition-transform"
            >
              Add text
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default CollabLayer;
