// Playful per-tab visitor identity for the collaborative canvas (Phase 3.5)
// and presence (Phase 4) — jessa.art-style adjective+noun nicknames, never a
// real name. Persisted in sessionStorage so a refresh mid-visit keeps the
// same identity, but a new tab/visit gets a new one.

const ADJECTIVES = [
  'Curious', 'Quiet', 'Friendly', 'Wandering', 'Thoughtful', 'Playful',
  'Observant', 'Cheerful', 'Nimble', 'Bold', 'Gentle', 'Sunny',
];

const NOUNS = [
  'Visitor', 'Wanderer', 'Explorer', 'Observer', 'Doodler', 'Guest',
  'Pixel Fan', 'Night Owl', 'Early Bird', 'Passerby', 'Scribbler', 'Pathfinder',
];

// Fixed, small palette — also doubles as the pen tool's color choices.
// Deliberately not a freeform color picker: fewer degrees of freedom for
// any single drawn thing to be able to encode something offensive, and it
// keeps every visitor's color visually distinct from the site's own accent
// tokens (so user content never reads as site chrome).
export const IDENTITY_COLORS = [
  '#FF3D81', '#3DDBFF', '#9B6BFF', '#FF9F3D', '#3DFFA8', '#FFE23D',
];

const STORAGE_KEY = 'canvas-identity';

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function createIdentity() {
  return {
    nickname: `${randomFrom(ADJECTIVES)} ${randomFrom(NOUNS)}`,
    color: randomFrom(IDENTITY_COLORS),
  };
}

// Returns null on the server (no sessionStorage) — callers only need this
// client-side, inside effects/event handlers.
export function getIdentity() {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.nickname && parsed?.color) return parsed;
    }
  } catch {
    // sessionStorage unavailable (private mode, blocked, etc) — fall through
    // to an in-memory-only identity for this call.
  }

  const identity = createIdentity();
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch {
    // Non-fatal — identity just won't survive a refresh this visit.
  }
  return identity;
}
