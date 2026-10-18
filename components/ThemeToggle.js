'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="flex items-center justify-center w-9 h-9 rounded-full border border-border/15 text-fg/70 hover:text-accent hover:border-accent/40 transition-colors shrink-0"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M20.742 13.045a8.088 8.088 0 0 1-2.077.263C14.205 13.308 10.597 9.7 10.597 5.337c0-1.49.406-2.886 1.113-4.08A9.713 9.713 0 0 0 2 11.646C2 17.01 6.343 21.354 11.708 21.354c5.082 0 9.243-3.903 9.673-8.872a.75.75 0 0 0-.639-.437z" />
        </svg>
      )}
    </button>
  );
}
