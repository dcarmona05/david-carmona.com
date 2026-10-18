'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/lib/site';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  // The canvas page (/) has its own CanvasNav doing the same Home/About/
  // Work/Contact navigation, front and center — showing this nav too would
  // be two navigations for the same thing, so it's hidden there (logo and
  // theme toggle still show everywhere).
  const isCanvasPage = usePathname() === '/';

  return (
    <header className="sticky top-0 z-40 border-b border-border/10 bg-bg/70 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.svg" alt="" aria-hidden="true" className="h-8 w-auto" />
          <span className="font-display font-bold text-lg text-fg">
            {siteConfig.name}
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-8">
          {!isCanvasPage && (
            <nav className="flex gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-fg/60 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          {!isCanvasPage && (
            <button
              type="button"
              className="p-2 -mr-2"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="block w-5 h-0.5 bg-fg mb-1.5" />
              <span className="block w-5 h-0.5 bg-fg mb-1.5" />
              <span className="block w-5 h-0.5 bg-fg" />
            </button>
          )}
        </div>
      </div>

      {open && !isCanvasPage && (
        <nav className="sm:hidden border-t border-border/10 px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-fg/60 hover:text-accent transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
