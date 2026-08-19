const PHASES = [
  {
    label: 'Discover',
    description: 'Audit existing patterns, talk to stakeholders, and map the problem space.',
    aiNote: 'AI helps synthesize research and surface patterns across large amounts of feedback faster.',
    color: '#FF3D81',
  },
  {
    label: 'Iterate',
    description: 'Explore multiple directions in parallel and test assumptions early.',
    aiNote: 'AI-generated variations widen the exploration space before committing to a direction.',
    color: '#D9FF3D',
  },
  {
    label: 'Prototype',
    description: 'Build interactive prototypes to validate flows before engineering investment.',
    aiNote: 'AI-assisted tooling speeds up prototyping, from layout generation to interaction logic.',
    color: '#3DDBFF',
  },
  {
    label: 'Develop',
    description: 'Partner with engineering to ship, document, and drive adoption.',
    aiNote: 'AI assists with documentation and consistency checks as the work ships.',
    color: '#FF3D81',
  },
];

export default function ProcessSteps() {
  return (
    <div>
      <p className="text-sm text-white/40 max-w-2xl">
        AI is used as a tool throughout — accelerating research synthesis, prototyping, and documentation, never replacing judgment on what to build.
      </p>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <p className="mt-2 text-xs text-accent3/80 leading-relaxed">{phase.aiNote}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
