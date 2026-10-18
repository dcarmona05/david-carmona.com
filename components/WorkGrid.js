'use client';

import { useEffect, useState } from 'react';
import CaseStudyCard from '@/components/CaseStudyCard';
import Reveal from '@/components/Reveal';
import { subscribeAllProjectViews } from '@/lib/projectViews';

/**
 * The real client-side counterpart to a static `work` array: subscribes to
 * live per-project view counts (lib/projectViews.js) and figures out which
 * project is currently "most viewed," then renders the grid. Kept separate
 * from `app/work/page.js` so that page can stay a server component (it
 * still needs its `metadata` export) while only this small island
 * hydrates for the live view-count data.
 */
export default function WorkGrid({ items, reveal = false, className = 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' }) {
  const [viewsBySlug, setViewsBySlug] = useState({});

  useEffect(() => subscribeAllProjectViews(setViewsBySlug), []);

  const mostViewedSlug = Object.entries(viewsBySlug).reduce(
    (best, [slug, count]) => (count > (viewsBySlug[best] || 0) ? slug : best),
    null
  );

  return (
    <div className={className}>
      {items.map((item, i) => {
        const card = (
          <CaseStudyCard
            item={item}
            viewCount={viewsBySlug[item.slug]}
            isMostViewed={Boolean(mostViewedSlug) && item.slug === mostViewedSlug}
          />
        );
        return reveal ? (
          <Reveal key={item.slug} delay={i * 0.06}>
            {card}
          </Reveal>
        ) : (
          <div key={item.slug}>{card}</div>
        );
      })}
    </div>
  );
}
