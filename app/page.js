'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import CanvasStage from '@/components/canvas/CanvasStage';
import CanvasNav from '@/components/canvas/CanvasNav';
import CollabToolbar from '@/components/canvas/CollabToolbar';
import CollabLayer from '@/components/canvas/CollabLayer';
import CommentsPanel from '@/components/canvas/CommentsPanel';
import PresenceCursors from '@/components/canvas/PresenceCursors';
import VisitorAvatars from '@/components/canvas/VisitorAvatars';
import VisitCounter from '@/components/canvas/VisitCounter';
import Frame from '@/components/canvas/Frame';
import WorkGrid from '@/components/WorkGrid';
import ContactForm from '@/components/ContactForm';
import HeroDoodle from '@/components/HeroDoodle';
import PhotoFrame from '@/components/PhotoFrame';
import PageShell from '@/components/PageShell';
import { siteConfig } from '@/lib/site';
import { work } from '@/lib/work';
import { getIdentity } from '@/lib/identity';
import { startPresence, subscribeVisitCount, countVisitOnce } from '@/lib/presence';

// World-space layout of the canvas regions — stacked top-to-bottom per
// David's preference for a vertical flow over side scrolling, in the same
// order as the DOM/Tab order below (Home, Work, Contact — Home now absorbs
// the former About region, see RegionContent below).
//
// Previous versions of this file hand-estimated each region's absolute y
// position, which caused two separate real bugs logged in
// CANVAS_REBUILD.md: Work's grid rendering taller than guessed (Contact
// overlapped it), and then overcorrecting that gap so far it read as "huge
// gaps" once content changed again. Both were symptoms of the same root
// cause — guessing a number instead of measuring it. Fixed at the root:
// regions now render in normal vertical flow (a flex column with one fixed
// REGION_GAP, not absolute x/y), so each region's real position is always
// exactly its real rendered height — never re-estimated, never wrong, and
// `limitToBounds` (CanvasStage) measures the real content size directly
// rather than needing a separate height value passed in.
const REGION_WIDTH = 700;
const WORLD_WIDTH = REGION_WIDTH + 200;
const REGION_GAP = 112;
const REGIONS = [
  { id: 'home', label: 'Home', width: REGION_WIDTH },
  { id: 'work', label: 'Work', width: REGION_WIDTH },
  { id: 'contact', label: 'Contact', width: REGION_WIDTH },
];

// Rendered once per region id, used by both the canvas Frame layout and the
// stacked skip-link fallback — same component, not a second copy to
// maintain (per CANVAS_REBUILD.md's accessibility plan).
function RegionContent({ id }) {
  if (id === 'home') {
    // Home now absorbs the former standalone About region — they repeated
    // similar "complex, enterprise-scale software" framing as two separate
    // stops on the same canvas, which read as redundant. One region, one
    // scan path: photo leads (David's explicit preference, over leading
    // with the name/role text block), then identity, then one consolidated
    // intro (merging the old hero line + first bio paragraph without
    // repeating the same idea twice), then the ways forward. `siteConfig`'s
    // `heroDescription`/`bio` are untouched — the real /about page still
    // reads from them directly, unforked.
    return (
      <div className="relative">
        <div className="hidden sm:block absolute -right-4 -top-10 w-40 h-40 opacity-80">
          <HeroDoodle />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <PhotoFrame src="/profile.jpg" alt={siteConfig.name} />
          <div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl leading-[1.1] tracking-tight text-fg">
              {siteConfig.name}
            </h1>
            <p className="mt-2 text-lg text-fg/60">{siteConfig.role}</p>
          </div>
        </div>
        <p className="mt-6 max-w-md text-fg/70 leading-relaxed text-balance">
          I design systems and products for complex, enterprise-scale
          software — first at LinkedIn for over a decade, now leading design
          systems and AI-assisted workflows at ServiceNow. I care about the
          details that make software feel considered, not just functional.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link
            href="/contact"
            className="inline-block bg-accent text-accent-ink font-medium px-5 py-2.5 rounded-md hover:scale-[1.03] transition-transform"
          >
            Get in touch
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center text-fg/70 hover:text-accent transition-colors"
          >
            Full bio &amp; experience &rarr;
          </Link>
        </div>
      </div>
    );
  }

  if (id === 'work') {
    return (
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display font-bold text-2xl text-fg">Work</h2>
          <Link href="/work" className="text-sm text-fg/60 hover:text-accent transition-colors">
            View all &rarr;
          </Link>
        </div>
        <div className="mt-6">
          <WorkGrid items={work} className="grid sm:grid-cols-2 gap-6" />
        </div>
      </div>
    );
  }

  // contact
  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-fg">Contact</h2>
      <p className="mt-3 text-fg/60 leading-relaxed text-balance">
        Have a project, a role, or just want to talk design? Send a message
        below, or head to the{' '}
        <Link href="/contact" className="text-accent hover:underline">
          full contact page
        </Link>{' '}
        to grab time directly on my calendar.
      </p>
      <div className="mt-6">
        <ContactForm />
      </div>
    </div>
  );
}

export default function HomePage() {
  const stageRef = useRef(null);
  const collabRef = useRef(null);
  const [mode, setMode] = useState('canvas');
  const [activeRegion, setActiveRegion] = useState('home');

  // Phase 3.5 — collaborative toolbar state.
  const [activeTool, setActiveTool] = useState('move');
  const [pendingSticker, setPendingSticker] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  // Phase 4 — live presence. `myIdentity` starts null (matches the server
  // render) and is only set inside the effect below — computing it directly
  // during render would make the client's first render disagree with the
  // server's and trigger a hydration mismatch (sessionStorage/Math.random
  // don't exist/match server-side).
  const presenceApiRef = useRef({ updateCursor: () => {} });
  const [others, setOthers] = useState({});
  const [visitCount, setVisitCount] = useState(0);
  const [myIdentity, setMyIdentity] = useState(null);

  useEffect(() => {
    let stopped = false;
    let api = { updateCursor: () => {}, stop: () => {} };
    const identity = getIdentity();
    setMyIdentity(identity);

    startPresence({
      nickname: identity.nickname,
      color: identity.color,
      onOthersChange: (next) => {
        if (!stopped) setOthers(next);
      },
    }).then((result) => {
      if (stopped) {
        result.stop();
        return;
      }
      api = result;
      presenceApiRef.current = api;
    });

    countVisitOnce();
    const unsubCount = subscribeVisitCount(setVisitCount);

    return () => {
      stopped = true;
      api.stop();
      unsubCount();
    };
  }, []);

  const panTo = useCallback((id) => {
    setActiveRegion(id);
    stageRef.current?.panToRegion(id);
  }, []);

  const selectTool = useCallback((tool) => {
    setActiveTool((current) => (current === tool ? 'move' : tool));
    setPendingSticker(null);
  }, []);

  if (mode === 'simple') {
    return (
      <PageShell>
        <div>
          <button
            type="button"
            onClick={() => setMode('canvas')}
            className="text-sm text-fg/60 hover:text-accent transition-colors"
          >
            &larr; Switch to the interactive canvas
          </button>
          <div className="mt-10 space-y-16">
            {REGIONS.map((region) => (
              <Frame key={region.id} id={region.id} title={region.label} stacked>
                <RegionContent id={region.id} />
              </Frame>
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setMode('simple')}
        className="sr-only focus:not-sr-only focus:fixed focus:bottom-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-accent focus:text-accent-ink focus:px-4 focus:py-2.5 focus:font-medium"
      >
        Skip the interactive canvas — view as a simple page
      </button>

      <CanvasStage
        ref={stageRef}
        initialRegionId="home"
        onActiveRegionChange={setActiveRegion}
        className="h-[calc(100vh-4rem)] min-h-[480px]"
        panningDisabled={activeTool !== 'move'}
        onCanvasPointerDown={(world, e) => collabRef.current?.handlePointerDown(world, e)}
        onCanvasPointerMove={(world, e) => collabRef.current?.handlePointerMove(world, e)}
        onCanvasPointerUp={(world, e) => collabRef.current?.handlePointerUp(world, e)}
        onPointerPositionChange={(world) => presenceApiRef.current.updateCursor(world.x, world.y)}
      >
        <div
          className="relative flex flex-col items-center"
          style={{ width: WORLD_WIDTH, gap: REGION_GAP, paddingTop: 60, paddingBottom: 60 }}
        >
          {REGIONS.map((region) => (
            <Frame key={region.id} id={region.id} title={region.label} width={region.width}>
              <RegionContent id={region.id} />
            </Frame>
          ))}
          <CollabLayer
            ref={collabRef}
            activeTool={activeTool}
            pendingSticker={pendingSticker}
            onStickerPlaced={() => setPendingSticker(null)}
            onLiveStatusChange={setIsLive}
          />
          <PresenceCursors others={others} />
        </div>
      </CanvasStage>

      <CanvasNav regions={REGIONS} active={activeRegion} onNavigate={panTo} />
      {/* Hidden until presence is actually live (same `isLive` signal
          CollabToolbar uses, from the shared Firebase connection) — a lone
          avatar with no one else around just read as an unexplained dot. */}
      {isLive && (
        <>
          <VisitorAvatars others={others} mine={myIdentity} />
          <VisitCounter count={visitCount} />
        </>
      )}

      <CollabToolbar
        activeTool={activeTool}
        onSelectTool={selectTool}
        isLive={isLive}
        commentCount={commentCount}
        commentsOpen={commentsOpen}
        onToggleComments={() => setCommentsOpen((v) => !v)}
        stickerPickerOpen={activeTool === 'sticker'}
        onSelectSticker={setPendingSticker}
      />

      <CommentsPanel
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        activeRegion={activeRegion}
        onCountChange={setCommentCount}
      />
    </>
  );
}
