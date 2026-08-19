const PHASES = [
  {
    label: 'Discover',
    description: 'Audit existing patterns, talk to stakeholders, and map the problem space.',
    color: '#FF3D81',
  },
  {
    label: 'Define',
    description: 'Frame the core problem and align on what success looks like.',
    color: '#D9FF3D',
  },
  {
    label: 'Design',
    description: 'Explore directions, prototype, and refine with feedback.',
    color: '#3DDBFF',
  },
  {
    label: 'Deliver',
    description: 'Ship, document, and drive adoption.',
    color: '#FF3D81',
  },
];

export default function ProcessSteps() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {PHASES.map((phase, i) => (
        <div key={phase.label} className="relative">
          <div className="flex items-center gap-3">
            <span
              className="flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-display font-medium text-white shrink-0"
              style={{ borderColor: phase.color }}
            >
              {i + 1}
            </span>
            <h3 className="font-display font-medium text-white">{phase.label}</h3>
          </div>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">{phase.description}</p>
        </div>
      ))}
    </div>
  );
}
