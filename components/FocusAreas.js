const PALETTE = ['#FF3D81', '#D9FF3D', '#3DDBFF'];

const FOCUS_BY_CATEGORY = {
  'Design Systems': {
    title: 'What a system like this covers',
    items: [
      'Design tokens — color, type, and spacing as shared, versioned primitives',
      'Component library — accessible, documented, and themeable',
      'Governance — contribution guidelines and a review process for changes',
      'Adoption — migration paths and support for teams moving over',
    ],
  },
  'Product Design': {
    title: 'What shapes a first-run experience',
    items: [
      'Reducing time-to-value — getting users to a meaningful first success quickly',
      'Progressive disclosure — surfacing complexity only when it’s needed',
      'Clear defaults — sensible starting points over blank slates',
      'Feedback loops — showing users the effect of their actions immediately',
    ],
  },
  'Interaction Design': {
    title: 'Principles for trustworthy AI interactions',
    items: [
      'Act vs. suggest — being explicit about when AI is autonomous versus advisory',
      'Reversibility — making AI actions easy to undo or review',
      'Transparency — showing why the AI suggested something',
      'Graceful failure — a clear fallback when AI gets it wrong',
    ],
  },
  'UX / Information Design': {
    title: 'Principles for dense, data-heavy interfaces',
    items: [
      'Visual hierarchy — surfacing what matters most first',
      'Progressive detail — summary views with drill-down on demand',
      'Scannability — layouts optimized for quick pattern recognition',
      'Consistent data visualization — shared chart and table conventions',
    ],
  },
  'Design Operations': {
    title: 'The rituals that keep a design org moving',
    items: [
      'Critique — regular, structured feedback sessions',
      'Handoff — clear specs and expectations between design and engineering',
      'Documentation — decisions and rationale captured, not just outcomes',
      'Cadence — predictable rhythms so process doesn’t become overhead',
    ],
  },
};

export default function FocusAreas({ category }) {
  const focus = FOCUS_BY_CATEGORY[category];
  if (!focus) return null;

  return (
    <div>
      <h3 className="font-display font-medium text-white">{focus.title}</h3>
      <ul className="mt-4 space-y-3">
        {focus.items.map((item, i) => (
          <li key={item} className="flex items-start gap-3">
            <span
              className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: PALETTE[i % 3] }}
            />
            <span className="text-white/70 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
