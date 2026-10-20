'use client';

import { Fragment, useEffect, useRef, useState } from 'react';

// The swimlane used to render each step as an isolated box with no visual
// link between them -- correct data, but it read as a grid of disconnected
// cards rather than a flow (David: "this doesn't really show me the user
// flow"). This draws a single connected, arrowed path through the steps in
// order, zig-zagging across lanes exactly the way the conversation actually
// does.
//
// Positions are measured from the real rendered DOM (getBoundingClientRect),
// not computed from grid math, because the grid's row heights aren't
// uniform (some step boxes wrap to two lines) and its column widths are only
// uniform once laid out -- same "measure reality instead of guessing"
// approach used for the canvas stage's own height (see CANVAS_REBUILD.md).

const LANES = [
  { key: 'customer', label: 'Customer', dot: 'bg-accent2' },
  { key: 'banker', label: 'Banker', dot: 'bg-fg' },
  { key: 'otto', label: 'Otto', dot: 'bg-accent3' },
];

const CALL_STEPS = [
  { lane: 'customer', title: 'Stop payment' },
  { lane: 'otto', title: 'Intent' },
  { lane: 'banker', title: 'Greet & verify' },
  { lane: 'otto', title: 'Identity' },
  { lane: 'banker', title: 'Check details' },
  { lane: 'customer', title: '"My paycheck?"' },
  { lane: 'otto', title: 'Recommended action' },
  { lane: 'banker', title: 'Answer deposit' },
];

export default function CallFlowDiagram() {
  const containerRef = useRef(null);
  const stepRefs = useRef([]);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const next = stepRefs.current.map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - containerRect.left,
          y: r.top + r.height / 2 - containerRect.top,
        };
      });
      setPoints(next);
    }

    // Double rAF: wait for real layout+paint before the first measurement,
    // the same idiom this project already settled on for the canvas's
    // initial-snap effect (CANVAS_REBUILD.md).
    let raf1;
    let raf2;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(measure);
    });

    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const gridCols = `76px repeat(${CALL_STEPS.length}, minmax(96px, 1fr))`;
  const validPoints = points.filter(Boolean);
  const pathD =
    validPoints.length > 1
      ? validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
      : '';

  return (
    <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div ref={containerRef} className="relative min-w-[860px]">
        {pathD && (
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" aria-hidden="true">
            <defs>
              <marker
                id="call-flow-arrow"
                viewBox="0 0 8 8"
                refX="6"
                refY="4"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="rgb(var(--color-accent))" />
              </marker>
            </defs>
            <path
              d={pathD}
              fill="none"
              stroke="rgb(var(--color-accent))"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeOpacity="0.55"
              markerEnd="url(#call-flow-arrow)"
            />
          </svg>
        )}
        <div className="relative grid gap-x-2 gap-y-3" style={{ gridTemplateColumns: gridCols }}>
          {LANES.map((lane) => (
            <Fragment key={lane.key}>
              <div className="flex items-center gap-2 py-3">
                <span className={`w-2 h-2 rounded-full ${lane.dot} shrink-0`} />
                <span className="text-[10px] font-mono uppercase tracking-wide text-fg/50">{lane.label}</span>
              </div>
              {CALL_STEPS.map((step, i) => (
                <div key={`${lane.key}-${i}`} className="border-t border-border/10 py-3 flex items-center">
                  {step.lane === lane.key && (
                    <div
                      ref={(el) => {
                        stepRefs.current[i] = el;
                      }}
                      className={`relative w-full rounded-md border px-2.5 py-2 ${
                        lane.key === 'otto' ? 'border-accent3/30 bg-accent3/5' : 'border-border/10 bg-surface/[0.03]'
                      }`}
                    >
                      <span className="absolute -top-2 -left-2 flex items-center justify-center w-4 h-4 rounded-full bg-bg border border-border/15 text-[9px] font-mono text-fg/40">
                        {i + 1}
                      </span>
                      <p className="text-xs font-display text-fg leading-snug">{step.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
