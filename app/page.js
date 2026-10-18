'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import CanvasStage from '@/components/canvas/CanvasStage';
import CanvasNav from '@/components/canvas/CanvasNav';
import Frame from '@/components/canvas/Frame';
import CaseStudyCard from '@/components/CaseStudyCard';
import ContactForm from '@/components/ContactForm';
import HeroDoodle from '@/components/HeroDoodle';
import PhotoFrame from '@/components/PhotoFrame';
import PageShell from '@/components/PageShell';
import { siteConfig } from '@/lib/site';
import { work } from '@/lib/work';

// World-space layout of the canvas regions. Positions are deliberately
// loose/whiteboard-style, not a rigid grid — but left-to-right in the same
// order as the DOM/Tab order below (Home, About, Work, Contact).
const REGIONS = [
  { id: 'home', label: 'Home', x: 80, y: 60, width: 620 },
  { id: 'about', label: 'About', x: 900, y: 20, width: 560 },
  { id: 'work', label: 'Work', x: 1620, y: 0, width: 1040 },
  { id: 'contact', label: 'Contact', x: 2820, y: 60, width: 560 },
];

const WORLD_WIDTH = 3500;
const WORLD_HEIGHT = 1300;

// Rendered once per region id, used by both the canvas Frame layout and the
// stacked skip-link fallback — same component, not a second copy to
// maintain (per CANVAS_REBUILD.md's accessibility plan).
function RegionContent({ id }) {
  if (id === 'home') {
    return (
      <div className="relative">
        <div className="hidden sm:block absolute -right-4 -top-10 w-40 h-40 opacity-80">
          <HeroDoodle />
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl leading-[1.1] tracking-tight text-fg">
          {siteConfig.name}
        </h1>
        <p className="mt-2 text-lg text-fg/60">{siteConfig.role}</p>
        <p className="mt-6 max-w-md text-fg/70 leading-relaxed">
          {siteConfig.heroDescription}
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-block bg-accent text-accent-ink font-medium px-5 py-2.5 rounded-md hover:scale-[1.03] transition-transform"
        >
          Get in touch
        </Link>
      </div>
    );
  }

  if (id === 'about') {
    return (
      <div>
        <div className="flex items-start gap-6">
          <PhotoFrame src="/profile.jpg" alt={siteConfig.name} />
          <div>
            <h2 className="font-display font-bold text-2xl text-fg">About</h2>
            <p className="mt-3 text-fg/70 leading-relaxed">{siteConfig.bio[0]}</p>
          </div>
        </div>
        <Link
          href="/about"
          className="mt-6 inline-flex items-center text-fg/70 hover:text-accent transition-colors"
        >
          Full bio &amp; experience &rarr;
        </Link>
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
        <div className="mt-6 grid sm:grid-cols-2 gap-6">
          {work.map((item) => (
            <CaseStudyCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    );
  }

  // contact
  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-fg">Contact</h2>
      <p className="mt-3 text-fg/60 leading-relaxed">
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
  const [mode, setMode] = useState('canvas');
  const [activeRegion, setActiveRegion] = useState('home');

  const panTo = useCallback((id) => {
    setActiveRegion(id);
    stageRef.current?.panToRegion(id);
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
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-accent focus:text-accent-ink focus:px-4 focus:py-2.5 focus:font-medium"
      >
        Skip the interactive canvas — view as a simple page
      </button>

      <CanvasStage
        ref={stageRef}
        initialRegionId="home"
        onActiveRegionChange={setActiveRegion}
        className="h-[calc(100vh-4rem)] min-h-[480px]"
      >
        <div className="relative" style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}>
          {REGIONS.map((region) => (
            <Frame
              key={region.id}
              id={region.id}
              title={region.label}
              x={region.x}
              y={region.y}
              width={region.width}
            >
              <RegionContent id={region.id} />
            </Frame>
          ))}
        </div>
      </CanvasStage>

      <CanvasNav regions={REGIONS} active={activeRegion} onNavigate={panTo} />
    </>
  );
}
