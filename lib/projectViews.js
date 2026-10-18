import { ref, onValue, off, update, increment } from 'firebase/database';
import { getFirebase, ensureAnonymousAuth } from './firebase';

// Real per-project view counts (inspired by jessa.art's "N views" pills on
// her case-study cards) — schema: /stats/projectViews/{slug} → number.
// Deliberately real data, not a fabricated/decorative number, per this
// project's honesty policy: a card only shows a view-count pill once it has
// one, and "most viewed" is computed from this live data, never hardcoded.
// Same fail-soft pattern as lib/presence.js throughout.

const VIEW_RECORDED_PREFIX = 'project-view-recorded:';

export function subscribeAllProjectViews(onViews) {
  const { db } = getFirebase();
  if (!db) {
    onViews({});
    return () => {};
  }
  const viewsRef = ref(db, 'stats/projectViews');
  const listener = onValue(
    viewsRef,
    (snapshot) => onViews(snapshot.val() || {}),
    () => onViews({})
  );
  return () => off(viewsRef, 'value', listener);
}

// Counts one view per project per browser tab/session, the same guard
// lib/presence.js's countVisitOnce uses and for the same reason — a
// detail page's view-tracking effect shouldn't double-count on a
// Strict Mode double-invoke or a client-side back/forward revisit.
export async function recordProjectViewOnce(slug) {
  const storageKey = `${VIEW_RECORDED_PREFIX}${slug}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, '1');
  } catch {
    // Risk a rare double-count over never counting at all.
  }

  const { db } = getFirebase();
  if (!db) return;
  const uid = await ensureAnonymousAuth();
  if (!uid) return;
  try {
    await update(ref(db), { [`stats/projectViews/${slug}`]: increment(1) });
  } catch {
    // Soft-fail — the count just won't move for this view.
  }
}
