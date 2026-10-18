'use client';

import { useEffect } from 'react';
import { recordProjectViewOnce } from '@/lib/projectViews';

// Invisible — records one real view for this case study (see
// lib/projectViews.js), embedded in the actual case-study detail pages so a
// card simply appearing in a grid never counts as a "view."
export default function ViewTracker({ slug }) {
  useEffect(() => {
    recordProjectViewOnce(slug);
  }, [slug]);

  return null;
}
