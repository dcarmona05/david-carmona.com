'use client';

import { useEffect, useRef } from 'react';

const VIEW_WIDTH = 1400;
const VIEW_HEIGHT = 460;
const OVERSCAN = 60;
const STEP = 20;

const LINES = [
  { y: 15, amplitude: 8, frequency: 1.5, phase: 0.2, depth: 0.45, color: '#FFFFFF', opacity: 0.045 },
  { y: 50, amplitude: 12, frequency: 1.1, phase: 1.0, depth: 0.5, color: '#FFFFFF', opacity: 0.05 },
  { y: 85, amplitude: 16, frequency: 1.7, phase: 1.8, depth: 0.55, color: '#3DDBFF', opacity: 0.04 },
  { y: 120, amplitude: 10, frequency: 1.3, phase: 0.6, depth: 0.6, color: '#FFFFFF', opacity: 0.055 },
  { y: 155, amplitude: 18, frequency: 1.9, phase: 2.4, depth: 0.65, color: '#FFFFFF', opacity: 0.06 },
  { y: 190, amplitude: 14, frequency: 1.2, phase: 1.3, depth: 0.7, color: '#D9FF3D', opacity: 0.035 },
  { y: 225, amplitude: 20, frequency: 1.6, phase: 3.0, depth: 0.75, color: '#FFFFFF', opacity: 0.065 },
  { y: 260, amplitude: 12, frequency: 1.0, phase: 0.4, depth: 0.8, color: '#FFFFFF', opacity: 0.07 },
  { y: 295, amplitude: 22, frequency: 1.8, phase: 2.0, depth: 0.85, color: '#3DDBFF', opacity: 0.045 },
  { y: 330, amplitude: 16, frequency: 1.4, phase: 1.1, depth: 0.9, color: '#FFFFFF', opacity: 0.075 },
  { y: 365, amplitude: 18, frequency: 1.5, phase: 2.7, depth: 0.95, color: '#FFFFFF', opacity: 0.08 },
  { y: 400, amplitude: 14, frequency: 1.2, phase: 0.9, depth: 1.0, color: '#D9FF3D', opacity: 0.05 },
  { y: 435, amplitude: 20, frequency: 1.7, phase: 1.6, depth: 1.05, color: '#FFFFFF', opacity: 0.09 },
];

function buildContourPath(baseY, amplitude, frequency, phase) {
  const points = [];
  for (let x = -OVERSCAN; x <= VIEW_WIDTH + OVERSCAN; x += STEP) {
    const y = baseY + Math.sin((x / VIEW_WIDTH) * frequency * Math.PI * 2 + phase) * amplitude;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${points.join(' L')}`;
}

export default function TopoBackground() {
  const pathRefs = useRef([]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let scrollY = window.scrollY;
    let frameId;

    function onScroll() {
      scrollY = window.scrollY;
    }

    function tick(now) {
      LINES.forEach((line, i) => {
        const el = pathRefs.current[i];
        if (!el) return;
        const idleY = Math.sin(now / 4200 + line.phase) * (3 + line.depth * 2);
        const idleX = Math.sin(now / 6000 + line.phase * 1.3) * (2 * line.depth);
        const scrollWave = Math.sin(scrollY / (420 / line.depth)) * (7 * line.depth);
        el.setAttribute(
          'transform',
          `translate(${(idleX).toFixed(2)}, ${(idleY + scrollWave).toFixed(2)})`
        );
      });
      frameId = requestAnimationFrame(tick);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    frameId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 bottom-0 h-[50vh] pointer-events-none overflow-hidden -z-10"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
      }}
    >
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMax slice"
        className="w-full h-full"
      >
        {LINES.map((line, i) => (
          <path
            key={i}
            ref={(el) => (pathRefs.current[i] = el)}
            d={buildContourPath(line.y, line.amplitude, line.frequency, line.phase)}
            fill="none"
            stroke={line.color}
            strokeOpacity={line.opacity}
            strokeWidth={1.25}
          />
        ))}
      </svg>
    </div>
  );
}
