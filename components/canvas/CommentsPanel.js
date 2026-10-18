'use client';

import { useEffect, useState } from 'react';
import {
  subscribeToComments,
  subscribeToPins,
  createComment,
  deleteComment,
  togglePin,
  countPins,
  loadLocalComments,
  saveLocalComments,
  MAX_COMMENT_LENGTH,
} from '@/lib/canvasSync';
import { getIdentity } from '@/lib/identity';
import { ensureAnonymousAuth } from '@/lib/firebase';

const OWNER_UID = process.env.NEXT_PUBLIC_CANVAS_OWNER_UID || null;

const REGIONS = [
  { id: 'home', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
];

/**
 * Moderated comments, aggregated across every canvas region (Phase 3.5) —
 * the "Comments · N" affordance jessa.art has. Opened/closed by
 * CollabToolbar; `onCountChange` reports the live total back up so the
 * toolbar's count stays correct even while this panel is closed.
 *
 * Redesigned per feedback: rendered as CollabToolbar's `children` (see
 * that component) so it stacks as a drop-up directly above the toolbar at
 * whatever height the toolbar actually is, instead of a separate
 * top-right card with its own independently-guessed fixed position. It
 * owns no positioning of its own, only the card's own layout. Region
 * association is automatic from `activeRegion` (which CanvasStage now
 * tracks continuously during free panning, not just on a CanvasNav click
 * or keyboard focus) instead of a manual page-picker — you were never
 * choosing anything CanvasNav/the camera didn't already know.
 */
export default function CommentsPanel({ open, onClose, activeRegion, onCountChange }) {
  const [remoteComments, setRemoteComments] = useState({});
  const [localComments, setLocalComments] = useState({});
  const [pins, setPins] = useState({});
  // Same local-optimistic fallback as CollabLayer's elements -- togglePin
  // needs `myUid`, which is null while Firebase auth is down (the real
  // current state), so without this, pinning a comment would silently do
  // nothing.
  const [localPinIds, setLocalPinIds] = useState(() => new Set());
  const [myUid, setMyUid] = useState(null);
  const [draftText, setDraftText] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    ensureAnonymousAuth().then(setMyUid);
  }, []);

  // See CollabLayer's identical pattern/comment -- loaded post-mount, not
  // in a lazy useState initializer, to avoid a hydration mismatch against
  // the server's always-empty render.
  useEffect(() => {
    const cached = loadLocalComments();
    if (Object.keys(cached).length) {
      setLocalComments((prev) => ({ ...cached, ...prev }));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveLocalComments(localComments);
  }, [hydrated, localComments]);

  useEffect(() => {
    const unsub = subscribeToComments(({ items }) => setRemoteComments(items || {}));
    return unsub;
  }, []);

  useEffect(() => subscribeToPins(({ items }) => setPins(items || {})), []);

  const comments = { ...localComments, ...remoteComments };

  useEffect(() => {
    onCountChange?.(Object.keys(comments).length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  if (!open) return null;

  const list = Object.entries(comments)
    .filter(([, comment]) => typeof comment.text === 'string' && comment.text.length > 0)
    .sort(([, a], [, b]) => (b.createdAt || 0) - (a.createdAt || 0));

  const regionId = activeRegion || 'home';
  const regionLabel = REGIONS.find((r) => r.id === regionId)?.label || regionId;

  async function handleSubmit(e) {
    e.preventDefault();
    const text = draftText.trim();
    if (!text) return;
    const identity = getIdentity();
    setDraftText('');

    // Local-optimistic, same reconciliation pattern as CollabLayer's canvas
    // elements: show it immediately, and if the write actually reaches
    // Firebase, drop the local-only copy (not re-key it) once the remote
    // subscription will deliver the real one.
    const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payload = {
      regionId,
      text,
      authorNickname: identity.nickname,
      authorColor: identity.color,
      createdAt: Date.now(),
    };
    setLocalComments((prev) => ({ ...prev, [tempId]: payload }));

    const result = await createComment({
      regionId,
      text,
      authorNickname: identity.nickname,
      authorColor: identity.color,
    });
    if (result.ok && result.id) {
      setLocalComments((prev) => {
        if (!(tempId in prev)) return prev;
        const next = { ...prev };
        delete next[tempId];
        return next;
      });
    }
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
    if (id in localComments) {
      setLocalComments((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    await deleteComment(id);
  }

  return (
    <div
      role="dialog"
      aria-label="Comments"
      className="w-[calc(100vw-2rem)] sm:w-96 max-h-[55vh] flex flex-col rounded-2xl border border-border/10 bg-bg shadow-xl"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/10 shrink-0">
        <span className="font-display font-medium text-fg text-sm">Comments</span>
        <button type="button" onClick={onClose} aria-label="Close comments" className="text-fg/40 hover:text-fg">
          ✕
        </button>
      </div>

      <div data-scroll-region className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {list.length === 0 && <p className="text-sm text-fg/40">No comments yet — be the first.</p>}
        {list.map(([id, comment]) => {
          const isLocalOnly = id in localComments && !(id in remoteComments);
          const canModerate = isLocalOnly || (myUid && (comment.authorUid === myUid || myUid === OWNER_UID));
          const isPinnedByMe = localPinIds.has(id) || !!(myUid && pins[id]?.[myUid]);
          const isPinned = isPinnedByMe || countPins(pins, id) > 0;
          const label = REGIONS.find((r) => r.id === comment.regionId)?.label || comment.regionId;
          return (
            <div key={id} className="group flex items-start gap-2.5">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: comment.authorColor || 'rgb(var(--color-accent))' }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-fg/80">{comment.authorNickname || 'Someone'}</span>
                  <span className="text-[10px] text-fg/30">· {label}</span>
                </div>
                <p className="mt-0.5 text-sm text-fg/80 break-words">{comment.text}</p>
              </div>
              <span className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                {canModerate && (
                  <button
                    type="button"
                    onClick={() => handleDelete(id)}
                    aria-label="Delete comment"
                    className="w-5 h-5 rounded-full border border-border/20 text-[10px] text-fg/60 hover:text-accent flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handlePin(id, isPinnedByMe)}
                  aria-label={isPinnedByMe ? 'Unpin comment' : 'Pin comment'}
                  aria-pressed={isPinned}
                  title={isPinnedByMe ? 'Unpin' : 'Pin'}
                  className={`w-5 h-5 rounded-full border text-[10px] flex items-center justify-center ${
                    isPinned ? 'border-accent text-accent' : 'border-border/20 text-fg/60 hover:text-accent'
                  }`}
                >
                  📌
                </button>
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border/10 p-3 shrink-0 space-y-1.5">
        <p className="text-[11px] text-fg/40 px-0.5">
          Commenting on <span className="text-fg/60 font-medium">{regionLabel}</span> — follows wherever you are on
          the canvas
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={draftText}
            maxLength={MAX_COMMENT_LENGTH}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 min-w-0 rounded-md border border-border/15 bg-surface/5 px-3 py-1.5 text-sm text-fg placeholder-fg/30 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-accent text-accent-ink text-sm font-medium px-3 py-1.5 hover:scale-[1.03] transition-transform"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
