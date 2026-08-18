# Build Log — david-carmona.com (rebuild)

This project was originally built in full (design system, 6 case studies with rich IA, AI chat widget, Cal.com booking, real email via Resend, animated hero, topo background, etc.) in a prior chat session, working in an ephemeral worker `/tmp` sandbox. That sandbox got wiped (not a bug — worker environments reset periodically) and the work was never pushed to GitHub, so it was lost from disk. This folder (`~/Documents/david-carmona.com`, your real persistent Documents folder) is the safe rebuild location going forward.

**Update:** `git init` is done and the repo is pushed to GitHub at `https://github.com/dcarmona05/david-carmona.com` (HTTPS remote via a personal access token entered interactively — no token stored in this repo). This is no longer at risk from a sandbox wipe. Keep committing and pushing as work continues.

**Branch note:** this GitHub repo pre-existed with an unrelated `master` branch (a 7-year-old screenshot + `.DS_Store`, GitHub's default branch). That old content was archived to `archive/old-master` and `master` was force-pushed to point at this rebuild's history instead (so it stays the default branch without needing a GitHub settings change). The `main` branch created during the initial push was deleted after that. Current default/working branch is `master`.

## What's rebuilt and confirmed working right now
- Full Next.js 14 (App Router) + Tailwind setup: `package.json`, `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `jsconfig.json`, `.gitignore`, `.env.local.example`
- Real assets: `public/logo.svg`, `public/profile.jpg` (copied from `~/Desktop/SN Desktop 25/`, which is where the originals live — `dclogo.svg` and `1768319206573.jpeg`)
- `lib/site.js`, `lib/work.js` (all 6 case studies, but only **core fields** — title/category/company/timeline/role/accent/description/overview/outcome. The original had much richer per-case-study fields: `team`, `goal`, `currentState`, `personas`, `research[]`, `iterations[]`, `feedback[]`, `solution[]`, `crossFunctional`, `validation` — NOT yet restored.)
- `components/`: `Header.js` (sticky, `bg-black/70 backdrop-blur-md`), `Footer.js`, `Reveal.js` (framer-motion scroll reveal), `HeroDoodle.js` (3-ring shape-morphing CSS animation — circle→triangle→square→hexagon, magenta/lime/cyan, dash patterns), `CaseStudyCard.js`
- `app/layout.js`, `app/page.js` (Home), `app/work/page.js` (Work index)
- Confirmed via `npm run dev` + opening `http://localhost:3000` — Home and Work pages actually render.
- `lib/experience.js` (real Experience data + skills list, as described in item 1 below), `components/PhotoFrame.js` (organic blob-shaped photo mask via SVG clipPath + offset lime blob behind it), `app/about/page.js` (bio, PhotoFrame, Experience timeline from `lib/experience.js`, Skills). Confirmed via `npm run dev` — `/about` returns 200, renders bio/experience/skills, `clip-path="url(#photo-blob)"` present in output.
- `components/ContactForm.js` (client component, POSTs JSON to `/api/contact`, no `mailto:` links), `app/api/contact/route.js` (calls Resend's API directly via `fetch`, reads `RESEND_API_KEY`/`CONTACT_TO_EMAIL`/`RESEND_FROM` from env, returns a friendly 503 if env vars aren't set rather than crashing), `app/contact/page.js`. Confirmed via `npm run dev` — `/contact` returns 200 and renders the form. **Not yet tested end-to-end** (no real `RESEND_API_KEY`/`CONTACT_TO_EMAIL` in `.env.local` yet — those still need to be set, and the key mentioned in this log's env section below still needs rotating in the Resend dashboard before use).
- `components/CalEmbed.js` (Cal.com inline booking widget, vanilla-JS embed snippet re-implemented in a `useEffect`, `theme: 'dark'` passed inside the `inline()` call's `config` object per the gotcha below, real link `david-carmona-zlqdrt/30min`), now placed next to `ContactForm` in `app/contact/page.js` (`lg:grid-cols-2`). Confirmed `/contact` still returns 200 and the container renders; the live Cal.com iframe itself needs visual confirmation in a real browser (curl can't execute the client-side embed script).

## Design system (must be preserved exactly — this took many iterations to land on)
- Font: Space Grotesk (`font-display`), bold sans. NOT a serif — an earlier "editorial serif" direction was fully replaced.
- Background: `#0A0A0A` near-black everywhere.
- Colors: `accent` = `#FF3D81` (magenta, the ONLY color used for anything clickable/interactive — buttons, links, hover states, focus rings), `accent2` = `#D9FF3D` (lime, decorative only), `accent3` = `#3DDBFF` (cyan, decorative only, added later). Never use accent2/accent3 for interactive elements — that was a deliberate rule.
- Favicon (not yet rebuilt): NOT the DC logo — a simple two-overlapping-circles mark (magenta+lime) at `app/icon.svg` + `app/apple-icon.png`, because the detailed logo turned to noise at 16×16/32×32.

## NOT yet rebuilt — do these next, in this rough order
1. `components/CalEmbed.js` — Cal.com inline booking widget next to the contact form (not yet added to `app/contact/page.js`), using the user's real Cal.com link `david-carmona-zlqdrt/30min`. Official Cal.com vanilla-JS embed snippet (no npm package). **Important gotcha**: pass `theme: 'dark'` inside the `inline()` call's `config` object — passing it to the separate `ui()` call silently does nothing (confirmed by testing).
2. `app/work/[slug]/page.js` — full case-study template with conditionally-rendered sections: Project Overview, Goal, Current State, Personas, Research, Iterations, Feedback, Solution, Cross-Functional Review, Validation, Outcome, Next-project link. Each section only renders if that case study has the data. This needs `lib/work.js` expanded back to its full field set (see above) to have content to show.
3. `components/AgentChat.js` — docked AI chat widget (closed pill → docked panel → full-screen states, using `AnimatePresence mode="wait"` — do NOT remove this, a previous attempt to remove it broke the widget's transitions), lives in `app/layout.js` so it persists across page navigation. Backed by `app/api/chat/route.js` (OpenAI via `fetch`, no SDK) + `lib/agentContext.js` (builds system prompt from site/experience/work data, instructed to only discuss the user's real background and refuse off-topic/prompt-injection). Needs `OPENAI_API_KEY` (same rotation caveat as the Resend key).
4. `components/TopoBackground.js` — faint procedural contour-line SVG, `position: fixed` to viewport bottom (not page-anchored), fades top-to-bottom via CSS mask, subtle scroll-linked wave via a `requestAnimationFrame`-throttled listener (bounded sine transform, NOT a monotonic drift). Applied to Home/About/Contact only, deliberately not Work or case studies. Line geometry must be overscanned ~60 units past the viewBox edges or the wave exposes blank space at the sides (this was a real bug, already fixed once).
5. `app/icon.svg` + `app/apple-icon.png` — the two-circle favicon described above.
6. `/resume.pdf` doesn't exist yet — the About page links to it but it will 404 until a real PDF is added.
7. Contact form is untested end-to-end — needs real `RESEND_API_KEY` and `CONTACT_TO_EMAIL` set in `.env.local` (the key pasted into a prior chat should be treated as compromised and rotated in the Resend dashboard first; `CONTACT_TO_EMAIL` should be the user's real Gmail, `dcarmona05@gmail.com`, since Resend's sandbox sender can only deliver to the account owner until a domain is verified).

## Real bugs hit before (avoid repeating)
- Tailwind's `content` config must include `./lib/**/*.js` or classes referenced only in `lib/work.js` never get generated.
- Injecting generated CSS via `<style>{cssString}</style>` causes a React hydration mismatch (server/client escape quotes differently) — always use `<style dangerouslySetInnerHTML={{ __html: cssString }} />` instead.
- Any auto-scroll `useEffect` (e.g. in a chat widget) must guard on `messages.length === 0` or it fires on mount and jumps the whole page.
- SVG logos: if a `<clipPath>` contains a `<rect>`, that's the clip boundary definition, not a visible background — never strip it thinking it's an opaque bg to remove.

## Environment variables needed (see `.env.local.example`)
`OPENAI_API_KEY`, `OPENAI_MODEL` (default `gpt-4o-mini`), `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_TO_EMAIL`. Both API keys were previously pasted directly into a chat and should be treated as compromised — rotate before reuse, never ask the user to paste a key into chat again, always have them set it via `.env.local` (gitignored) or the deployment platform's env var UI.

## Before deploying
- ~~`git init` this folder, push to GitHub~~ — done, see top of this file. Still need to: connect the GitHub repo to Netlify.
- Add all env vars above to Netlify's dashboard (never commit `.env.local`).
- Domain: transfer from Network Solutions to Porkbun was in progress as of the original build; once complete, point nameservers at Netlify.
