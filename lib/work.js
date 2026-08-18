export const work = [
  {
    slug: 'design-system-at-scale',
    title: 'A Design System at Scale',
    category: 'Design Systems',
    company: 'ServiceNow',
    timeline: '2024 — 2025',
    role: 'Principal Designer',
    accent: 'from-[#FF3D81] to-[#0A0A0A]',
    description: 'Unifying a fragmented product suite under one design language, adopted across dozens of teams.',
    overview: 'Multiple product teams had drifted into inconsistent patterns, components, and visual language, each rebuilding basic UI independently because there was no shared source of truth to pull from.',
    outcome: 'Adopted across dozens of teams, cutting design-to-build time and giving the product a consistent feel end to end.',
  },
  {
    slug: 'reimagining-onboarding',
    title: 'Reimagining Onboarding',
    category: 'Product Design',
    company: 'ServiceNow',
    timeline: '2023 — 2024',
    role: 'Principal Designer',
    accent: 'from-[#D9FF3D] to-[#0A0A0A]',
    description: 'Cutting time-to-value for new users by rethinking the first-run experience end to end.',
    overview: 'New users were dropping off before reaching real value in the product. This project rebuilt the first-run experience around a single clear path.',
    outcome: 'Meaningfully reduced time-to-value for new users and improved early retention.',
  },
  {
    slug: 'ai-assisted-workflows',
    title: 'AI-Assisted Workflows',
    category: 'Interaction Design',
    company: 'ServiceNow',
    timeline: '2025',
    role: 'Principal Designer',
    accent: 'from-[#3DDBFF] to-[#0A0A0A]',
    description: 'Designing trustworthy AI touchpoints that assist without overstepping user intent.',
    overview: 'AI features were being added ad hoc across the product, with no consistent point of view on when AI should act versus suggest.',
    outcome: 'A consistent, trustworthy interaction model for AI features across the product.',
  },
  {
    slug: 'enterprise-dashboard-redesign',
    title: 'Enterprise Dashboard Redesign',
    category: 'UX / Information Design',
    company: 'LinkedIn',
    timeline: '2022 — 2023',
    role: 'Principal Designer',
    accent: 'from-[#FF3D81]/70 to-[#0A0A0A]',
    description: 'Turning a dense, data-heavy console into something people actually want to open.',
    overview: 'A core operational dashboard had grown dense and hard to scan over years of feature additions.',
    outcome: 'A dashboard users could scan in seconds instead of minutes, with far fewer support tickets.',
  },
  {
    slug: 'cross-platform-component-library',
    title: 'Cross-Platform Component Library',
    category: 'Design Systems',
    company: 'LinkedIn',
    timeline: '2023',
    role: 'Principal Designer',
    accent: 'from-[#D9FF3D]/70 to-[#0A0A0A]',
    description: 'One source of truth for components across web, mobile, and internal tools.',
    overview: 'Web, mobile, and internal tools each maintained their own component implementations, causing drift and duplicated work.',
    outcome: 'One source of truth for components, reducing duplicated design and engineering effort across platforms.',
  },
  {
    slug: 'design-ops-playbook',
    title: 'Design Ops Playbook',
    category: 'Design Operations',
    company: 'ServiceNow',
    timeline: '2024',
    role: 'Principal Designer',
    accent: 'from-[#3DDBFF]/70 to-[#0A0A0A]',
    description: 'Processes and rituals that let a growing design org move fast without losing quality.',
    overview: 'As the design org grew, ad hoc processes started to break down — inconsistent critique, unclear handoff, duplicated work.',
    outcome: 'A growing design org that moved faster and shipped more consistent work without added overhead.',
  },
];

export function getWorkBySlug(slug) {
  return work.find((item) => item.slug === slug);
}

export function getNextWork(slug) {
  const index = work.findIndex((item) => item.slug === slug);
  if (index === -1) return work[0];
  return work[(index + 1) % work.length];
}
