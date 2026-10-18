import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// All NEXT_PUBLIC_* — Firebase web config is meant to be public; security
// lives in Realtime Database rules, not in hiding this config. Fails soft
// (returns null, never throws) if the env vars aren't set, same
// graceful-degradation pattern as the existing OpenAI/Resend integrations —
// a Firebase hiccup never breaks the canvas itself.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = Object.values(firebaseConfig).every(Boolean);

let app = null;
let db = null;
let auth = null;

export function getFirebase() {
  if (!isConfigured) return { app: null, db: null, auth: null };
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
    db = getDatabase(app);
    auth = getAuth(app);
  }
  return { app, db, auth };
}

let authReadyPromise = null;

// Resolves with the signed-in anonymous user's uid, or null if Firebase
// isn't configured or the sign-in fails for any reason (offline, blocked,
// etc). Safe to call repeatedly — reuses one in-flight sign-in attempt.
export function ensureAnonymousAuth() {
  const { auth: authInstance } = getFirebase();
  if (!authInstance) return Promise.resolve(null);

  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(
        authInstance,
        (user) => {
          if (user) {
            unsubscribe();
            resolve(user.uid);
            return;
          }
          signInAnonymously(authInstance).catch(() => {
            unsubscribe();
            resolve(null);
          });
        },
        () => resolve(null)
      );
    });
  }

  return authReadyPromise;
}
