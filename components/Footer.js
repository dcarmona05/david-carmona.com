'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/lib/site';

export default function Footer() {
  // The canvas page (/) sizes <main> to exactly the remaining viewport
  // height (app/page.js measures it directly) so the canvas fits snugly
  // with no dead space below it -- this mt-24 breathing room, meant for
  // normal scrolling pages whose content doesn't already fill the
  // viewport, instead reopened the "black gap before the footer" bug this
  // project already fixed once (in the canvas's own height calc) in a
  // different, global-CSS-level form: a fixed 96px margin after an
  // already-exact-fit <main> just pushes the footer below the fold.
  const isCanvasPage = usePathname() === '/';

  return (
    <footer className={`border-t border-border/10 ${isCanvasPage ? '' : 'mt-24'}`}>
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-fg/50">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}</p>
        <div className="flex gap-6">
          <a href={siteConfig.linkedin} className="hover:text-accent transition-colors">LinkedIn</a>
          <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
