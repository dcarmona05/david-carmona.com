import { ref, onValue, off, onDisconnect, set, update, serverTimestamp, increment } from 'firebase/database';
import { getFirebase, ensureAnonymousAuth } from './firebase';

// Phase 4 — Firebase live presence. Schema (see CANVAS_REBUILD.md):
//   /presence/{uid}      → { nickname, color, cursor:{x,y}, connectedAt, lastActive }
//   /stats/totalVisits   → atomic increment
// Fails soft throughout: every function resolves to a no-op if Firebase
// isn't configured or anonymous auth doesn't resolve a uid — a Firebase
// hiccup never breaks the canvas itself.

const CURSOR_THROTTLE_MS = 120;
const VISIT_COUNTED_KEY = 'canvas-visit-counted';

/**
 * Starts this visitor's presence: writes an initial /presence/{uid} record,
 * registers an RTDB onDisconnect() so it's removed automatically if the tab
 * closes or the connection drops (no heartbeat needed — this is exactly
 * what RTDB's onDisconnect is for), and subscribes to every other visitor's
 * presence. Returns `{ updateCursor(worldX, worldY), stop() }`; both are
 * safe to call even if setup failed (no-ops).
 */
export async function startPresence({ nickname, color, onOthersChange }) {
  const { db } = getFirebase();
  if (!db) return { updateCursor: () => {}, stop: () => {} };

  const uid = await ensureAnonymousAuth();
  if (!uid) return { updateCursor: () => {}, stop: () => {} };

  const myRef = ref(db, `presence/${uid}`);
  try {
    await set(myRef, {
      nickname,
      color,
      cursor: { x: 0, y: 0 },
      connectedAt: serverTimestamp(),
      lastActive: serverTimestamp(),
    });
    onDisconnect(myRef).remove();
  } catch {
    // Still try to show other visitors' presence below even if we
    // couldn't announce our own — better than nothing.
  }

  const presenceRef = ref(db, 'presence');
  const listener = onValue(
    presenceRef,
    (snapshot) => {
      const all = snapshot.val() || {};
      const others = Object.fromEntries(Object.entries(all).filter(([id]) => id !== uid));
      onOthersChange?.(others);
    },
    () => onOthersChange?.({})
  );

  let lastSentAt = 0;
  function updateCursor(worldX, worldY) {
    const now = Date.now();
    if (now - lastSentAt < CURSOR_THROTTLE_MS) return;
    lastSentAt = now;
    update(myRef, { cursor: { x: worldX, y: worldY }, lastActive: serverTimestamp() }).catch(() => {});
  }

  function stop() {
    off(presenceRef, 'value', listener);
    set(myRef, null).catch(() => {});
  }

  return { updateCursor, stop };
}

export function subscribeVisitCount(onCount) {
  const { db } = getFirebase();
  if (!db) {
    onCount(0);
    return () => {};
  }
  const countRef = ref(db, 'stats/totalVisits');
  const listener = onValue(
    countRef,
    (snapshot) => onCount(snapshot.val() || 0),
    () => onCount(0)
  );
  return () => off(countRef, 'value', listener);
}

// Counts this visit once per browser tab/session (guarded by
// sessionStorage, same pattern as lib/identity.js) rather than once per
// component mount — React effects (especially Strict Mode) can otherwise
// double-fire this.
export async function countVisitOnce() {
  try {
    if (window.sessionStorage.getItem(VISIT_COUNTED_KEY)) return;
    window.sessionStorage.setItem(VISIT_COUNTED_KEY, '1');
  } catch {
    // If sessionStorage is unavailable we'd rather risk a rare double-count
    // than never count at all.
  }

  const { db } = getFirebase();
  if (!db) return;
  const uid = await ensureAnonymousAuth();
  if (!uid) return;
  try {
    await update(ref(db), { 'stats/totalVisits': increment(1) });
  } catch {
    // Soft-fail — the counter just won't move this visit.
  }
}
