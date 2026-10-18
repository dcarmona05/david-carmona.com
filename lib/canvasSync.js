import {
  ref,
  push,
  set,
  remove,
  onValue,
  off,
  serverTimestamp,
} from 'firebase/database';
import { getFirebase, ensureAnonymousAuth } from './firebase';

// Phase 3.5 — collaborative canvas data layer. See CANVAS_REBUILD.md's
// "Phase 3.5 design" section for the full data model and moderation
// rationale. Every function here fails soft: if Firebase isn't configured,
// or the Realtime Database's security rules haven't been deployed yet (the
// real, current state as of this writing — RTDB is still locked per Phase
// 0), calls resolve to a `{ ok: false, reason }` result instead of
// throwing, and subscriptions report a `status` instead of silently
// hanging. The canvas itself must never break because of this layer.

export const ELEMENT_TYPES = ['frame', 'text', 'pen', 'sticker'];
// Still a fixed, curated enum (not a free emoji picker/search) — bigger per
// David's feedback, but the same "structurally can't encode something
// offensive" reasoning from the moderation design still applies.
export const STICKERS = [
  '👍', '🎨', '💡', '🚀', '✨', '👋', '🔥', '❤️',
  '🎉', '👀', '💬', '📌', '⭐', '✅', '🙌', '😄',
  '🤔', '☕', '🌱', '🎯',
];
export const MAX_PEN_POINTS = 200;
export const MAX_TEXT_LENGTH = 140;
export const MAX_COMMENT_LENGTH = 280;
export const FLAG_HIDE_THRESHOLD = 3;

// Text elements' size/font are also fixed enums, same reasoning as
// IDENTITY_COLORS (lib/identity.js) — a few deliberate choices, not a
// freeform style editor.
export const TEXT_SIZES = [
  { id: 'sm', label: 'S', className: 'text-xs' },
  { id: 'md', label: 'M', className: 'text-sm' },
  { id: 'lg', label: 'L', className: 'text-base' },
];
export const TEXT_FONTS = [
  { id: 'sans', label: 'Sans', className: 'font-sans' },
  { id: 'display', label: 'Display', className: 'font-display' },
  { id: 'mono', label: 'Mono', className: 'font-mono' },
];

// Local-only persistence (this browser's own not-yet-synced elements/
// comments) — a visitor-requested fix so drawings survive a refresh while
// Firebase is unconfigured/unreachable (the real current state), instead of
// only ever living in React state. Deliberately a plain localStorage blob,
// not IndexedDB/anything heavier — this is a small, bounded amount of data
// (one visitor's own unsynced items) with no query needs.
const LOCAL_ELEMENTS_KEY = 'canvas-local-elements';
const LOCAL_COMMENTS_KEY = 'canvas-local-comments';

function loadLocalCache(key) {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalCache(key, items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Non-fatal — private mode / storage full / blocked. Items just won't
    // survive a refresh this visit, same soft-fail philosophy as the rest
    // of this module.
  }
}

// Read once, synchronously, on mount (not in a lazy useState initializer —
// that would run during the client's first render, before hydration
// reconciles against the server's empty-by-construction markup, which is
// exactly the hydration-mismatch bug CANVAS_REBUILD.md already documents
// once for presence identity. Callers load this inside a useEffect instead.
export function loadLocalElements() {
  return loadLocalCache(LOCAL_ELEMENTS_KEY);
}

export function saveLocalElements(items) {
  saveLocalCache(LOCAL_ELEMENTS_KEY, items);
}

export function loadLocalComments() {
  return loadLocalCache(LOCAL_COMMENTS_KEY);
}

export function saveLocalComments(items) {
  saveLocalCache(LOCAL_COMMENTS_KEY, items);
}

// Client-side cooldown between writes — purely a UX throttle (disables the
// toolbar briefly) so one person can't spam-click. The real security
// boundary is the Realtime Database rules, which a malicious client could
// always bypass by writing directly to the REST API; this just keeps a
// normal visitor's own client well-behaved.
const WRITE_COOLDOWN_MS = 400;
let lastWriteAt = 0;

function canWriteNow() {
  const now = Date.now();
  if (now - lastWriteAt < WRITE_COOLDOWN_MS) return false;
  lastWriteAt = now;
  return true;
}

async function withAuth() {
  const { db } = getFirebase();
  if (!db) return { db: null, uid: null };
  const uid = await ensureAnonymousAuth();
  return { db, uid };
}

function subscribe(path, onData) {
  const { db } = getFirebase();
  if (!db) {
    onData({ status: 'unconfigured', items: {} });
    return () => {};
  }

  const nodeRef = ref(db, path);
  const listener = onValue(
    nodeRef,
    (snapshot) => {
      onData({ status: 'connected', items: snapshot.val() || {} });
    },
    () => {
      // Permission-denied is the expected state until David pastes the real
      // RTDB rules (see CANVAS_REBUILD.md) — not a bug, just "not live yet."
      onData({ status: 'unavailable', items: {} });
    }
  );

  return () => off(nodeRef, 'value', listener);
}

export function subscribeToElements(onData) {
  return subscribe('canvas/elements', onData);
}

export function subscribeToComments(onData) {
  return subscribe('canvas/comments', onData);
}

export function subscribeToFlags(onData) {
  return subscribe('canvas/moderation/flags', onData);
}

export function countFlags(flagsByItemId, itemId) {
  const flags = flagsByItemId?.[itemId];
  return flags ? Object.keys(flags).length : 0;
}

async function createNode(collectionPath, payload) {
  if (!canWriteNow()) return { ok: false, reason: 'rate-limited' };

  const { db, uid } = await withAuth();
  if (!db || !uid) return { ok: false, reason: 'unavailable' };

  try {
    const listRef = ref(db, collectionPath);
    const newRef = push(listRef);
    await set(newRef, {
      ...payload,
      authorUid: uid,
      createdAt: serverTimestamp(),
    });
    return { ok: true, id: newRef.key };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export function createElement({ type, authorNickname, ...fields }) {
  if (!ELEMENT_TYPES.includes(type)) return Promise.resolve({ ok: false, reason: 'invalid' });
  return createNode('canvas/elements', { type, authorNickname, ...fields });
}

export function createComment({ regionId, text, authorNickname, authorColor }) {
  const trimmed = (text || '').trim().slice(0, MAX_COMMENT_LENGTH);
  if (!trimmed) return Promise.resolve({ ok: false, reason: 'invalid' });
  return createNode('canvas/comments', { regionId, text: trimmed, authorNickname, authorColor });
}

async function removeNode(path) {
  const { db, uid } = await withAuth();
  if (!db || !uid) return { ok: false, reason: 'unavailable' };
  try {
    await remove(ref(db, path));
    return { ok: true };
  } catch {
    // Expected for anyone who isn't the author or the site owner — the
    // rules are the real gate, this is just "it didn't work" feedback.
    return { ok: false, reason: 'denied' };
  }
}

export function deleteElement(id) {
  return removeNode(`canvas/elements/${id}`);
}

export function deleteComment(id) {
  return removeNode(`canvas/comments/${id}`);
}

export async function flagItem(id) {
  const { db, uid } = await withAuth();
  if (!db || !uid) return { ok: false, reason: 'unavailable' };
  try {
    await set(ref(db, `canvas/moderation/flags/${id}/${uid}`), true);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
