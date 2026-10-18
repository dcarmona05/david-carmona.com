'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  subscribeToElements,
  subscribeToFlags,
  createElement,
  deleteElement,
  flagItem,
  countFlags,
  MAX_PEN_POINTS,
  MAX_TEXT_LENGTH,
  FLAG_HIDE_THRESHOLD,
} from '@/lib/canvasSync';
import { getIdentity } from '@/lib/identity';
import { ensureAnonymousAuth } from '@/lib/firebase';

const OWNER_UID = process.env.NEXT_PUBLIC_CANVAS_OWNER_UID || null;
const PEN_MIN_POINT_DISTANCE = 4;
const DEFAULT_FRAME_SIZE = { width: 220, height: 140 };

function pointsToPath(points) {
  if (!points?.length) return '';
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
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
  const [flags, setFlags] = useState({});
  const [myUid, setMyUid] = useState(null);
  const [flaggedByMe, setFlaggedByMe] = useState(() => new Set());
  const [draft, setDraft] = useState(null); // { tool, x, y, text }
  const [drawingId, setDrawingId] = useState(null);
  const identityRef = useRef(null);

  useEffect(() => {
    identityRef.current = getIdentity();
    ensureAnonymousAuth().then(setMyUid);
  }, []);

  useEffect(() => {
    const unsub = subscribeToElements(({ status, items }) => {
      onLiveStatusChange?.(status === 'connected');
      setRemoteElements(items || {});
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => subscribeToFlags(({ items }) => setFlags(items || {})), []);

  const commitLocal = useCallback(async (tempId, payload) => {
    const identity = identityRef.current || getIdentity();
    const result = await createElement({
      ...payload,
      authorNickname: identity.nickname,
    });
    if (result.ok && result.id) {
      setLocalElements((prev) => {
        if (!(tempId in prev)) return prev;
        const next = { ...prev };
        const data = next[tempId];
        delete next[tempId];
        next[result.id] = data;
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
        setDraft({
          tool: 'frame',
          x: x - DEFAULT_FRAME_SIZE.width / 2,
          y: y - DEFAULT_FRAME_SIZE.height / 2,
          text: '',
        });
        return;
      }
      if (activeTool === 'text') {
        setDraft({ tool: 'text', x, y, text: '' });
        return;
      }
      if (activeTool === 'sticker' && pendingSticker) {
        placeElement({ type: 'sticker', stickerId: pendingSticker, x, y });
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
      if (activeTool !== 'pen' || !drawingId) return;
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
    },
    [activeTool, drawingId]
  );

  const handlePointerUp = useCallback(() => {
    if (activeTool !== 'pen' || !drawingId) return;
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

  function commitDraft() {
    if (!draft) return;
    const text = draft.text.trim().slice(0, MAX_TEXT_LENGTH);
    setDraft(null);
    if (!text) return;
    if (draft.tool === 'frame') {
      placeElement({
        type: 'frame',
        x: draft.x,
        y: draft.y,
        width: DEFAULT_FRAME_SIZE.width,
        height: DEFAULT_FRAME_SIZE.height,
        text,
      });
    } else {
      placeElement({ type: 'text', x: draft.x, y: draft.y, text });
    }
  }

  async function handleFlag(id) {
    setFlaggedByMe((prev) => new Set(prev).add(id));
    await flagItem(id);
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
  const entries = Object.entries(merged).filter(([, el]) => {
    if (el.type === 'pen') return Array.isArray(el.points) && el.points.length >= 2;
    if (el.type === 'frame') return typeof el.x === 'number' && typeof el.y === 'number';
    if (el.type === 'text') return typeof el.x === 'number' && typeof el.y === 'number' && typeof el.text === 'string';
    if (el.type === 'sticker') return typeof el.x === 'number' && typeof el.y === 'number' && typeof el.stickerId === 'string';
    return false;
  });

  return (
    <>
      {entries.map(([id, el]) => {
        const flagCount = countFlags(flags, id);
        const isHidden = flagCount >= FLAG_HIDE_THRESHOLD;
        // A not-yet-synced element only exists in this visitor's own
        // browser, so they can always delete it regardless of auth state —
        // there's nothing shared yet to need a permission check for.
        const isLocalOnly = id in localElements && !(id in remoteElements);
        const canModerate = isLocalOnly || (myUid && (myUid === el.authorUid || myUid === OWNER_UID));
        if (isHidden && !canModerate) return null;

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
            {!flaggedByMe.has(id) && (
              <button
                type="button"
                onClick={() => handleFlag(id)}
                aria-label="Flag as inappropriate"
                className="w-5 h-5 rounded-full bg-bg border border-border/20 text-[10px] text-fg/70 hover:text-accent flex items-center justify-center shadow"
              >
                ⚑
              </button>
            )}
          </span>
        );

        if (el.type === 'pen') {
          const path = pointsToPath(el.points);
          const xs = el.points.map((p) => p[0]);
          const ys = el.points.map((p) => p[1]);
          const minX = Math.min(...xs) - 10;
          const minY = Math.min(...ys) - 10;
          const w = Math.max(...xs) - minX + 20;
          const h = Math.max(...ys) - minY + 20;
          return (
            <div
              key={id}
              className="group absolute"
              style={{ left: minX, top: minY, width: w, height: h }}
            >
              <svg width={w} height={h} className="overflow-visible pointer-events-none">
                <path
                  d={pointsToPath(el.points.map(([x, y]) => [x - minX, y - minY]))}
                  fill="none"
                  stroke={el.color || '#FF3D81'}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isHidden ? 0.3 : 1}
                />
              </svg>
              {controls}
            </div>
          );
        }

        if (el.type === 'sticker') {
          return (
            <div
              key={id}
              className="group absolute text-3xl select-none"
              style={{ left: el.x - 18, top: el.y - 18, opacity: isHidden ? 0.3 : 1 }}
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
                opacity: isHidden ? 0.3 : 1,
              }}
            >
              {el.text && (
                <span
                  className="absolute -top-6 left-0 text-xs font-medium px-1"
                  style={{ color: el.color }}
                >
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
            className="group absolute max-w-[220px] text-sm font-medium px-2 py-1 rounded bg-bg/80 border"
            style={{ left: el.x, top: el.y, borderColor: el.color, color: el.color, opacity: isHidden ? 0.3 : 1 }}
          >
            {el.text}
            {controls}
          </div>
        );
      })}

      {draft && (
        <div
          className="absolute z-10"
          style={{ left: draft.x, top: draft.y, width: draft.tool === 'frame' ? DEFAULT_FRAME_SIZE.width : 220 }}
        >
          <input
            autoFocus
            type="text"
            value={draft.text}
            maxLength={MAX_TEXT_LENGTH}
            placeholder={draft.tool === 'frame' ? 'Label this frame…' : 'Say something…'}
            onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
            onBlur={commitDraft}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitDraft();
              if (e.key === 'Escape') setDraft(null);
            }}
            className="w-full rounded-md border border-accent bg-bg px-2 py-1.5 text-sm text-fg shadow-lg focus:outline-none"
          />
        </div>
      )}
    </>
  );
});

export default CollabLayer;
