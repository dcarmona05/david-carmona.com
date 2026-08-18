'use client';

import { useEffect, useRef } from 'react';

const VIEW_WIDTH = 1400;
const VIEW_HEIGHT = 420;
const OVERSCAN = 60;
const STEP = 20;

const LINES = [
  { y: 60, amplitude: 10, frequency: 1.4, phase: 0.3, color: '#FFFFFF', opacity: 0.06 },
  { y: 120, amplitude: 14, frequency: 1.1, phase: 1.2, color: '#FFFFFF', opacity: 0.07 },
  { y: 180, amplitude: 18, frequency: 1.6, phase: 2.1, color: '#3DDBFF', opacity: 0.05 },
  { y: 235, amplitude: 16, frequency: 1.3, phase: 0.8, color: '#FFFFFF', opacity: 0.08 },
  { y: 290, amplitude: 20, frequency: 1.8, phase: 1.7, color: '#D9FF3D', opacity: 0.04 },
  { y: 345, amplitude: 14, frequency: 1.2, phase: 2.6, color: '#FFFFFF', opacity: 0.09 },
  { y: 395, amplitude: 18, frequency: 1.5, phase: 0.5, color: '#FFFFFF', opacity: 0.1 },
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
  const shiftRef = useRef(null);

  useEffect(() => {
    let ticking = false;

    function applyShift() {
      const scrollY = window.scrollY;
      const wave = Math.sin(scrollY / 400) * 10;
      const drift = Math.sin(scrollY / 900) * 6;
      if (shiftRef.current) {
        shiftRef.current.style.transform = `translate(${drift.toFixed(2)}px, ${wave.toFixed(2)}px)`;
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyShift);
      }
    }

    applyShift();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 bottom-0 h-[45vh] pointer-events-none overflow-hidden -z-10"
      style={{
        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
      }}
    >
      <div ref={shiftRef} className="absolute inset-0">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          preserveAspectRatio="xMidYMax slice"
          className="w-full h-full"
        >
          {LINES.map((line, i) => (
            <path
              key={i}
              d={buildContourPath(line.y, line.amplitude, line.frequency, line.phase)}
              fill="none"
              stroke={line.color}
              strokeOpacity={line.opacity}
              strokeWidth={1.25}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
