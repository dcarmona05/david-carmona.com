'use client';

import { useEffect, useState } from 'react';
import {
  subscribeToComments,
  subscribeToFlags,
  createComment,
  deleteComment,
  flagItem,
  countFlags,
  MAX_COMMENT_LENGTH,
  FLAG_HIDE_THRESHOLD,
} from '@/lib/canvasSync';
import { getIdentity } from '@/lib/identity';
import { ensureAnonymousAuth } from '@/lib/firebase';

const OWNER_UID = process.env.NEXT_PUBLIC_CANVAS_OWNER_UID || null;

const REGIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
];

/**
 * Moderated comments, aggregated across every canvas region (Phase 3.5) —
 * the "Comments · N" affordance jessa.art has. Opened/closed by
 * CollabToolbar; `onCountChange` reports the live total back up so the
 * toolbar's count stays correct even while this panel is closed.
 */
export default function CommentsPanel({ open, onClose, activeRegion, onCountChange }) {
  const [remoteComments, setRemoteComments] = useState({});
  const [localComments, setLocalComments] = useState({});
  const [flags, setFlags] = useState({});
  const [myUid, setMyUid] = useState(null);
  const [flaggedByMe, setFlaggedByMe] = useState(() => new Set());
  const [draftText, setDraftText] = useState('');
  const [draftRegion, setDraftRegion] = useState(activeRegion || 'home');

  useEffect(() => {
    ensureAnonymousAuth().then(setMyUid);
  }, []);

  useEffect(() => {
    const unsub = subscribeToComments(({ items }) => setRemoteComments(items || {}));
    return unsub;
  }, []);

  useEffect(() => subscribeToFlags(({ items }) => setFlags(items || {})), []);

  useEffect(() => {
    if (activeRegion) setDraftRegion(activeRegion);
  }, [activeRegion]);

  const comments = { ...localComments, ...remoteComments };

  useEffect(() => {
    onCountChange?.(Object.keys(comments).length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  if (!open) return null;

  const list = Object.entries(comments)
    .filter(([, comment]) => typeof comment.text === 'string' && comment.text.length > 0)
    .filter(([id]) => {
      const flagCount = countFlags(flags, id);
      const canModerate = myUid && (comments[id]?.authorUid === myUid || myUid === OWNER_UID);
      return flagCount < FLAG_HIDE_THRESHOLD || canModerate;
    })
    .sort(([, a], [, b]) => (b.createdAt || 0) - (a.createdAt || 0));

  async function handleSubmit(e) {
    e.preventDefault();
    const text = draftText.trim();
    if (!text) return;
    const identity = getIdentity();
    setDraftText('');

    // Local-optimistic, same reconciliation pattern as CollabLayer's canvas
    // elements: show it immediately, and if the write actually reaches
    // Firebase, re-key it under the real id so the eventual remote echo
    // doesn't render as a duplicate.
    const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payload = { regionId: draftRegion, text, authorNickname: identity.nickname, createdAt: Date.now() };
    setLocalComments((prev) => ({ ...prev, [tempId]: payload }));

    const result = await createComment({ regionId: draftRegion, text, authorNickname: identity.nickname });
    if (result.ok && result.id) {
      setLocalComments((prev) => {
        if (!(tempId in prev)) return prev;
        const next = { ...prev };
        const data = next[tempId];
        delete next[tempId];
        next[result.id] = data;
        return next;
      });
    }
  }

  async function handleFlag(id) {
    setFlaggedByMe((prev) => new Set(prev).add(id));
    await flagItem(id);
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
      className="fixed top-20 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-80 max-h-[70vh] flex flex-col rounded-xl border border-border/10 bg-bg shadow-xl"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/10 shrink-0">
        <span className="font-display font-medium text-fg text-sm">Comments</span>
        <button type="button" onClick={onClose} aria-label="Close comments" className="text-fg/40 hover:text-fg">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {list.length === 0 && <p className="text-sm text-fg/40">No comments yet — be the first.</p>}
        {list.map(([id, comment]) => {
          const isLocalOnly = id in localComments && !(id in remoteComments);
          const canModerate = isLocalOnly || (myUid && (comment.authorUid === myUid || myUid === OWNER_UID));
          const regionLabel = REGIONS.find((r) => r.id === comment.regionId)?.label || comment.regionId;
          return (
            <div key={id} className="group relative rounded-lg border border-border/10 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-fg/70">{comment.authorNickname || 'Someone'}</span>
                <span className="text-[10px] uppercase tracking-wide text-fg/30">{regionLabel}</span>
              </div>
              <p className="mt-1 text-sm text-fg/80 break-words">{comment.text}</p>
              <span className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
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
                {!flaggedByMe.has(id) && (
                  <button
                    type="button"
                    onClick={() => handleFlag(id)}
                    aria-label="Flag comment as inappropriate"
                    className="w-5 h-5 rounded-full border border-border/20 text-[10px] text-fg/60 hover:text-accent flex items-center justify-center"
                  >
                    ⚑
                  </button>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border/10 p-3 shrink-0 space-y-2">
        <select
          value={draftRegion}
          onChange={(e) => setDraftRegion(e.target.value)}
          className="w-full text-xs rounded-md border border-border/15 bg-surface/5 px-2 py-1.5 text-fg"
        >
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              On: {r.label}
            </option>
          ))}
        </select>
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
