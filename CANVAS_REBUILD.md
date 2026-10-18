# Infinite-Canvas Rebuild + Light/Dark Theme

Planned in a Claude Code session on 2026-10-17 (plan mode, approved). Read this file first in any session working on this initiative — it's the source of truth for scope and technical decisions, not just a historical note.

## Status

- [ ] **Phase 0** — Firebase account setup (David's action)
- [x] **Phase 1** — Light/dark theme system
- [ ] **Phase 2** — `PageShell` extraction
- [ ] **Phase 3** — Canvas engine + static frames (no multiplayer)
- [ ] **Phase 4** — Firebase live presence
- [ ] **Phase 5** — Optional guestbook/comments (moderated, no deadline)

Update the checkboxes above as each phase ships, and append a dated note under **Progress Log** at the bottom of this file (same append-only style as `BUILD_LOG.md`) — don't rewrite history, add to it.

## Context

David wants two things: (1) a light/dark theme system, defaulting to **light**, and (2) a full rebuild of the site's front door into an "infinite canvas" experience inspired by [jessa.art](https://jessa.art/) — a pannable, dotted-grid FigJam-style space where nav links pan a camera between regions instead of loading pages, with a strong "alive" feeling from real-time multiplayer presence (other visitors' cursors with playful nicknames, a live visitor-count avatar stack, a running visit counter). He explicitly chose this ambitious full-rebuild option over a smaller "presence overlay on existing pages" alternative, and separately confirmed the "room" concept should start **presence-only** (no public guestbook/write-access yet — that's Phase 5, and needs its own moderation thinking before it ships).

This site already has real, hard-won work that must not regress: a password-gated `/work` section, a fully bespoke Otto case-study page (real screenshots lightbox, real video, custom diagrams — see `BUILD_LOG.md`'s "Otto case study — iteration round" section for the full history of how that page got polished), a working OpenAI-backed chat widget, and a working Resend-backed contact form. The rebuild has to add the new experience without breaking any of that.

## Scope boundary (the key decision)

The canvas becomes the new **`/`** — the front door and hub for Home / About-summary / Work-index / Contact-intro, the way jessa.art's Home/About/Work/Talks/Say-hi are all regions of one canvas.

**Case-study deep-dives stay exactly as they are** — the Otto page and the 5 generic-template pages remain normal routed `/work/[slug]` pages, reached by clicking a project frame on the canvas, not absorbed into it. The password gate (`middleware.js`), the generic template, and Otto's bespoke page are untouched by this rebuild.

**`/about` and `/contact` also stay alive as real, full routed pages in parallel** with their canvas-region counterparts (reusing the same data/components, not forked content). This isn't scope creep — it's the accessibility fallback target, the stable URL recruiters/LinkedIn already point at, and the thing that keeps `sitemap.js`/SEO exactly as good as today.

`CalEmbed` (Cal.com iframe) stays only on the real `/contact` page — iframes inside a CSS-`transform: scale()` ancestor are a known cross-browser pointer/sizing hazard, not worth the risk for a scheduling widget. The canvas Contact frame gets the real `ContactForm` embedded directly (it's just a form, transform-safe) plus a link to the full `/contact` page.

## Technical decisions

- **Canvas engine: `react-zoom-pan-pinch`** (not hand-rolled, not a canvas/WebGL lib like konva/fabric/pixi, not a full editor like tldraw). It server-renders real children — genuine `<section>`/`<h2>`/`<a>`/`<form>` DOM, only wrapped in a transformed div with pointer/wheel handlers attached client-side. That's what keeps SEO and accessibility intact. Its imperative ref (`zoomToElement`, `setTransform`) is exactly the "nav link pans the camera" mechanism, and `duration: 0` is the `prefers-reduced-motion` escape hatch.
- **Real-time presence: Firebase Realtime Database + Anonymous Auth**, not Firestore (RTDB's native `onDisconnect()` is built for ephemeral presence; Firestore needs a heartbeat/Cloud-Function workaround and a billing account). Anonymous auth is invisible to visitors but lets security rules require `auth != null` instead of leaving the DB world-writable.
  - Schema: `/presence/{clientId}` → `{nickname, color, cursor:{x,y}, connectedAt, lastActive}`; `/stats/totalVisits` via an atomic increment.
  - Nicknames/colors generated client-side (adjective+noun combos like jessa.art's "Wanderer"/"Pixel fan"), persisted per-tab via `sessionStorage` so a refresh doesn't reassign identity mid-visit.
  - **New env vars** (all `NEXT_PUBLIC_*` — Firebase web config is meant to be public; security lives in RTDB rules): `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_DATABASE_URL`, `_PROJECT_ID`, `_APP_ID`. Same `.env.local` + Netlify-dashboard pattern already used for `OPENAI_API_KEY`/`RESEND_API_KEY`.
  - Presence components fail soft (no-op) if env vars are absent, same graceful-degradation pattern as the existing OpenAI/Resend integrations — a Firebase hiccup never breaks the canvas itself.
- **Theme system: CSS variables + `data-theme` attribute.** Semantic tokens (`bg`/`fg`/`surface`/`border`/`accent`/`accent2`/`accent3`) defined under `:root[data-theme="light"]` and `:root[data-theme="dark"]` in `globals.css`. A small blocking inline script in `app/layout.js`'s `<head>` reads `localStorage.theme` (defaulting to `'light'` — ignoring OS `prefers-color-scheme` on purpose, per David's explicit ask) and sets `data-theme` before hydration, using `dangerouslySetInnerHTML` (the exact hydration-mismatch bug from a raw string literal is already documented in `BUILD_LOG.md` — don't rediscover it).
  - Dark tokens = today's exact values (zero regression): bg `#0A0A0A`, accents `#FF3D81`/`#D9FF3D`/`#3DDBFF`.
  - Light tokens: bg `#FAF9F6` (warm off-white, not pure white), fg `#141414`, and *darkened* accents for AA text contrast (`#D6006B`/`#7A8F00`/`#0088A8`) — a separate `--color-accent*-bright` set keeps the original punchy hexes available for decorative-only uses (HeroDoodle, TopoBackground, canvas grid tint).
  - A light, cream, dotted-grid canvas is also the aesthetically "correct" choice here, not just a preference — FigJam/Miro/jessa.art are all light-canvas tools; dark dots-on-black reads as a technical blueprint grid, not a whiteboard. Light-as-default reinforces the canvas metaphor, it doesn't fight it.
  - Real work is mechanical: every hardcoded `bg-[#0A0A0A]` / `text-white` / `border-white/10` across all ~18 components needs migrating to the semantic tokens. Otto's page (the most bespoke, most recently-polished markup) needs its own explicit visual re-check after this pass.
- **Accessibility & SEO fallback:**
  1. Real DOM everywhere (locked in by the engine choice) — full text content present in SSR output regardless of camera position.
  2. Tab order stays the normal sequential DOM order at all times, independent of camera position — no `role="application"` (strips standard AT behavior); arrow-key panning is an addition, not a replacement for Tab access.
  3. A visible, standard `sr-only focus:not-sr-only` skip link: "Skip the interactive canvas — view as a simple page," rendering the same Frame components stacked in linear reading order with no transform wrapper (same components, different outer layout, not a second copy to maintain).
  4. Reduced motion: `prefers-reduced-motion: reduce` → pass `duration: 0` to every `setTransform`/`zoomToElement` call (instant snap, no momentum), extending the existing `MotionConfig reducedMotion="user"` philosophy already in `app/layout.js`.
  5. `sitemap.js` keeps listing `/`, `/about`, `/contact` exactly as today.

## Phasing (each phase independently deployable; site never left in a broken state)

0. **Firebase account setup — David's action, not code.** Create the Firebase project at console.firebase.google.com, enable Realtime Database + Anonymous sign-in, hand over the 5 `NEXT_PUBLIC_FIREBASE_*` values. This is the only phase that introduces a new third-party account requirement.
1. **Theme system.** Token refactor (`tailwind.config.js`, new `app/globals.css` theme block), `ThemeProvider`/`ThemeToggle`, blocking inline script, mechanical class-migration pass across all components, dedicated Otto-page visual re-check. Fully shippable alone — every existing page just re-skins correctly in both themes, nothing else changes yet.
2. **`PageShell` extraction.** Pull `app/layout.js`'s `max-w-5xl mx-auto px-6 py-16` wrapper out into `components/PageShell.js`; every existing page (`/`, `/about`, `/contact`, `/work`, `/work/[slug]`, Otto, `/work/locked`) wraps itself in it instead. Zero visual diff, verifiable by direct before/after comparison — de-risks Phase 3's full-bleed requirement.
3. **Canvas engine + static frames, no multiplayer yet.** Install `react-zoom-pan-pinch`; build `CanvasStage`/`Frame`/`CanvasNav`; Home/About/Work-index/Contact frames reusing existing data and components; `app/page.js` switches over; skip-link fallback, keyboard panning, reduced-motion wiring, and an SEO/Lighthouse pass. Ship and fully verify as a pure static nav experience before touching Firebase.
4. **Firebase presence.** `lib/firebase.js`, `lib/presence.js`, `PresenceCursors`/`VisitorAvatars`/`VisitCounter` components, RTDB security rules, Netlify env vars. Fails soft if unconfigured.
5. **Optional stretch — guestbook/comments.** Same RTDB patterns as Phase 4, moderated (per the earlier "presence first, guestbook later" agreement). No deadline pressure on this one.

## Dependencies to add

```json
"dependencies": {
  "react-zoom-pan-pinch": "^3.x",   // Phase 3
  "firebase": "^11.x"                 // Phase 4
}
```
Nothing else required.

## New / touched files

**New:** `components/canvas/CanvasStage.js`, `Frame.js`, `CanvasNav.js`, `PresenceCursors.js`, `VisitorAvatars.js`, `VisitCounter.js`; `lib/firebase.js`, `lib/presence.js`; `components/ThemeProvider.js`, `ThemeToggle.js`, `PageShell.js`.

**Touched:** `app/layout.js` (full-bleed main + theme script only — no logic changes), `app/page.js` (becomes the canvas entry point), `app/about/page.js` / `contact/page.js` / `work/page.js` / `work/[slug]/page.js` / `work/otto-for-contact-center/page.js` / `work/locked/page.js` (each wrapped in `PageShell`, otherwise untouched — Otto page must come out identical), `tailwind.config.js` + new `app/globals.css` theme block, all ~18 `components/*` files (theme class-name migration). `netlify.toml` is unaffected — no hosting/config changes needed anywhere in this plan.

## Verification per phase

- **Phase 1:** `npm run build` clean; manually toggle the theme on every existing route (`/`, `/about`, `/contact`, `/work` unlocked, a generic case study, the Otto page) and visually confirm both themes read correctly, especially Otto's swimlane diagram and lightbox; confirm `localStorage` persistence survives a reload and there's no flash-of-wrong-theme.
- **Phase 2:** Direct visual diff of every page before/after — must be pixel-identical. `npm run build` clean.
- **Phase 3:** Verify pan/zoom works via mouse drag, trackpad pinch, and arrow keys; verify Tab order reaches every frame in sequential DOM order regardless of camera position; verify the skip-link fallback renders the same content linearly; verify `prefers-reduced-motion` gives instant snaps; run a Lighthouse pass and confirm `/about`/`/contact`/`/work` still appear correctly in `sitemap.xml`; confirm case-study links from Work-index frame still hit the password gate correctly.
- **Phase 4:** Confirm presence appears/disappears correctly across two real browser tabs/sessions (including the disconnect case — closing a tab should remove that cursor within a few seconds); confirm the app still works with Firebase env vars absent (soft-fail, no console errors breaking the page); confirm RTDB security rules reject malformed writes (test from the browser console, not just the UI).

## Sequencing note

This is realistically 5+ separate build sessions, not one sitting. Start a **fresh chat per phase** — each phase's session should carry only that phase's files in context, not this whole planning discussion. Phase 0 (Firebase account) is David's action item and can happen anytime before Phase 4. Phase 1 (theme) is the natural next session to actually start building.

## Progress Log

- **2026-10-17**: Plan researched (full codebase inventory + technical architecture design, both via dedicated research passes) and approved by David. Nothing built yet.
- **2026-10-17**: **Phase 1 (light/dark theme system) built and shipped.**
  - Semantic CSS-variable tokens (`--color-bg`/`fg`/`surface`/`border`/`accent`/`accent2`/`accent3`) added in `app/globals.css` under `:root[data-theme="dark"]` and `:root[data-theme="light"]`, wired into Tailwind via `tailwind.config.js`'s `colors` (each using the `rgb(var(--color-x) / <alpha-value>)` pattern so opacity modifiers like `bg-bg/70` keep working). Dark values are the site's original, unchanged hex (`#0A0A0A` bg, `#FF3D81`/`#D9FF3D`/`#3DDBFF` accents) — zero regression by construction. Light values: bg `#FAF9F6`, fg `#141414`, and darkened accents (`#D6006B`/`#7A8F00`/`#0088A8`) for AA text contrast.
  - Two new tokens beyond the plan's original list, both needed for real AA compliance once accents darken in light mode: **`accent-bright`/`accent2`/`accent3-bright`** (always the original punchy hex, used for decorative-only art — `HeroDoodle`, `TopoBackground`'s inline SVG colors, `PhotoFrame`'s blob — none of which needed touching since they already hardcode the punchy hex, which now equals the bright token's value in both themes) and **`accent-ink`** (black in dark / white in light — the text/icon color for anything sitting on an `bg-accent` surface, e.g. button labels; needed because dark mode's bright accent reads fine with black text, but light mode's necessarily-darker accent needs white text to stay AA-compliant).
  - `components/ThemeProvider.js` (React context, reads/writes `data-theme` + `localStorage.theme`) and `components/ThemeToggle.js` (sun/moon icon button, added to `Header.js` both desktop and mobile) — new files, matching the plan's touched-files list.
  - `app/layout.js`: added a blocking inline `<script>` in a new `<head>` (via `dangerouslySetInnerHTML`, per the existing hydration-mismatch gotcha already documented in `BUILD_LOG.md`) that reads `localStorage.theme` and sets `data-theme` on `<html>` before paint — defaults to `'light'` on any error or absence, deliberately ignoring OS `prefers-color-scheme`. `<html>` got `suppressHydrationWarning` since the attribute is set by vanilla JS outside React's own render. Wrapped children in `<ThemeProvider>`.
  - Migrated all ~18 `components/*` files and every `app/**/page.js` from hardcoded `bg-[#0A0A0A]`/`text-white`/`border-white/10`-style classes to the semantic tokens (`bg-bg`, `text-fg`, `border-border`, etc.), opacity modifiers preserved exactly (e.g. `text-white/60` → `text-fg/60`).
  - **Deliberately left literal** (not tokenized), because these are image/video overlays or an always-dark lightbox, not site chrome, so they should stay the same regardless of theme: hero image/gradient scrims and the pill/label text sitting on them (`CaseStudyCard`, `app/work/[slug]/page.js`'s and the Otto page's hero blocks), `VideoGallery`'s thumbnail play-button overlay, `ScreenshotGallery`'s fullscreen lightbox (`bg-black/90` + its white-on-black buttons/caption — a photo lightbox is conventionally dark regardless of page theme), and the decorative `PALETTE` hex arrays in `AbstractVisual.js`/`FocusAreas.js`/`AudienceArchetypes.js`/`ProcessSteps.js` (illustrative dots/badges/diagrams, not chrome — same reasoning as the `-bright` tokens). `app/apple-icon.js` and `app/opengraph-image.js` (static generated favicon/OG image) also untouched — they're not live-rendered against the toggle. `CalEmbed.js`'s own Cal.com `theme: 'dark'` config value was left as-is (an external widget setting, out of scope).
  - One real catch during the Otto page migration: the swimlane legend's "Banker" dot was hardcoded `bg-white`, which would've gone nearly invisible against the light theme's cream background. Changed to `bg-fg` so it correctly inverts to a dark dot in light mode (confirmed visually) — the lime/cyan Customer/Otto dots didn't have this problem since they're already accent-token colors.
  - **Verified**: `npm run build` clean (no type/lint errors). Visually confirmed both themes via Playwright on `/`, `/about`, `/contact`, `/work` (unlocked), a generic case study (`ai-powered-disputes-workspace`), and the Otto page (full scroll, swimlane, screenshot gallery, stats, blockquote) — all legible with correct contrast, zero visual regression in dark mode (side-by-side matches pre-change screenshots), no hydration warnings/errors in console, and `localStorage` persistence survives a reload with no flash-of-wrong-theme (script runs before paint).
  - Noted but **not fixed** (pre-existing, unrelated to this phase): `middleware.js`'s `/work/:path*` matcher also catches static image requests like `/work/otto-contact-center/*.png` while `/work` is still locked, 307-redirecting them — harmless (images 404/broken-icon only while locked; they load fine once unlocked) but worth a dedicated fix later.
