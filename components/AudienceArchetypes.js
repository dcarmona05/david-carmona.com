const PALETTE = ['#FF3D81', '#D9FF3D', '#3DDBFF'];

const ARCHETYPES_BY_CATEGORY = {
  'Design Systems': [
    { role: 'Product Designer', need: 'Consistent, reusable components instead of rebuilding basics on every project.' },
    { role: 'Engineer', need: 'Clear specs and code-ready components with minimal ambiguity.' },
    { role: 'New team member', need: 'A fast way to learn existing patterns without relying on tribal knowledge.' },
  ],
  'Product Design': [
    { role: 'First-time user', need: 'A fast, clear path to a meaningful first success.' },
    { role: 'Returning user', need: 'Efficient, low-friction re-entry into their workflow.' },
    { role: 'Setup owner', need: 'Confidence that configuration was done correctly.' },
  ],
  'Interaction Design': [
    { role: 'Everyday user', need: 'AI help without losing control over outcomes.' },
    { role: 'Power user', need: 'AI that accelerates repetitive work rather than replacing judgment.' },
    { role: 'Skeptical user', need: 'Enough transparency to trust the AI before relying on it.' },
  ],
  'UX / Information Design': [
    { role: 'Analyst', need: 'To scan dense data quickly and spot what changed.' },
    { role: 'Manager', need: 'A high-level summary without digging into detail.' },
    { role: 'Occasional visitor', need: 'A dashboard that makes sense without training.' },
  ],
  'Design Operations': [
    { role: 'Individual designer', need: 'Clear expectations and less ambiguity in process.' },
    { role: 'Design manager', need: 'Visibility into how work is progressing across the team.' },
    { role: 'Cross-functional partner', need: 'Predictable handoff and collaboration points.' },
  ],
};

export default function AudienceArchetypes({ category }) {
  const archetypes = ARCHETYPES_BY_CATEGORY[category];
  if (!archetypes) return null;

  return (
    <div className="grid sm:grid-cols-3 gap-6">
      {archetypes.map((person, i) => (
        <div key={person.role} className="rounded-lg border border-white/10 p-5">
          <span
            className="inline-flex w-8 h-8 rounded-full items-center justify-center text-xs font-display font-medium text-black"
            style={{ backgroundColor: PALETTE[i % 3] }}
          >
            {person.role.charAt(0)}
          </span>
          <h4 className="mt-3 font-display font-medium text-white">{person.role}</h4>
          <p className="mt-1.5 text-sm text-white/60 leading-relaxed">{person.need}</p>
        </div>
      ))}
    </div>
  );
}
