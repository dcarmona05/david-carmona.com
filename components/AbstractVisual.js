const PALETTE = ['#FF3D81', '#D9FF3D', '#3DDBFF'];

function DesignSystemsVisual() {
  const swatches = Array.from({ length: 12 });
  return (
    <div className="grid grid-cols-4 gap-3 w-full h-full p-6">
      {swatches.map((_, i) => (
        <div
          key={i}
          className="rounded-md border border-white/10"
          style={{
            backgroundColor: `${PALETTE[i % 3]}${i % 5 === 0 ? '30' : '12'}`,
            aspectRatio: '1 / 1',
          }}
        />
      ))}
    </div>
  );
}

function ProductDesignVisual() {
  return (
    <div className="flex flex-col gap-3 w-full h-full p-6 justify-center">
      {[0.9, 0.6, 0.75].map((w, i) => (
        <div key={i} className="rounded-md border border-white/10 bg-white/5 p-3" style={{ width: `${w * 100}%` }}>
          <div className="h-2 rounded-full" style={{ width: '40%', backgroundColor: `${PALETTE[i % 3]}80` }} />
          <div className="mt-2 h-1.5 rounded-full bg-white/10 w-full" />
          <div className="mt-1.5 h-1.5 rounded-full bg-white/10 w-2/3" />
        </div>
      ))}
    </div>
  );
}

function InteractionDesignVisual() {
  const nodes = [
    { x: 15, y: 30 },
    { x: 50, y: 15 },
    { x: 50, y: 55 },
    { x: 85, y: 35 },
  ];
  return (
    <svg viewBox="0 0 100 70" className="w-full h-full p-6" preserveAspectRatio="xMidYMid meet">
      <line x1="15" y1="30" x2="50" y2="15" stroke="#FF3D81" strokeOpacity="0.5" strokeWidth="0.6" />
      <line x1="15" y1="30" x2="50" y2="55" stroke="#D9FF3D" strokeOpacity="0.5" strokeWidth="0.6" />
      <line x1="50" y1="15" x2="85" y2="35" stroke="#3DDBFF" strokeOpacity="0.5" strokeWidth="0.6" />
      <line x1="50" y1="55" x2="85" y2="35" stroke="#FF3D81" strokeOpacity="0.5" strokeWidth="0.6" />
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="4" fill={PALETTE[i % 3]} fillOpacity="0.7" />
      ))}
    </svg>
  );
}

function InfoDesignVisual() {
  const bars = [0.4, 0.7, 0.5, 0.9, 0.6, 0.3];
  return (
    <div className="flex items-end gap-3 w-full h-full p-6">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md"
          style={{ height: `${h * 100}%`, backgroundColor: `${PALETTE[i % 3]}50` }}
        />
      ))}
    </div>
  );
}

function DesignOpsVisual() {
  const steps = 4;
  return (
    <div className="flex items-center w-full h-full p-6 gap-2">
      {Array.from({ length: steps }).map((_, i) => (
        <div key={i} className="flex items-center flex-1">
          <div
            className="w-8 h-8 rounded-full border-2 shrink-0"
            style={{ borderColor: PALETTE[i % 3] }}
          />
          {i < steps - 1 && <div className="flex-1 h-px bg-white/15 mx-1" />}
        </div>
      ))}
    </div>
  );
}

const VISUALS_BY_CATEGORY = {
  'Design Systems': DesignSystemsVisual,
  'Product Design': ProductDesignVisual,
  'Interaction Design': InteractionDesignVisual,
  'UX / Information Design': InfoDesignVisual,
  'Design Operations': DesignOpsVisual,
};

export default function AbstractVisual({ category }) {
  const Visual = VISUALS_BY_CATEGORY[category] || DesignSystemsVisual;
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden aspect-[16/10]">
      <Visual />
    </div>
  );
}
