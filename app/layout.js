import './globals.css';
import { Space_Grotesk } from 'next/font/google';
import { MotionConfig } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgentChat from '@/components/AgentChat';
import LoadingSplash from '@/components/LoadingSplash';
import ThemeProvider from '@/components/ThemeProvider';
import { siteConfig } from '@/lib/site';

// Runs before React hydrates, so the correct theme is set pre-paint (no flash).
// Defaults to 'light' on purpose, ignoring OS prefers-color-scheme (per spec).
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
});

export const metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.role}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.tagline,
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.role}`,
    description: siteConfig.tagline,
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.role}`,
    description: siteConfig.tagline,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-bg text-fg">
        <LoadingSplash />
        <ThemeProvider>
          <MotionConfig reducedMotion="user">
            <Header />
            {/* min-h-0 overrides a flex item's default min-height:auto --
                without it, a flex item won't shrink below its content's
                natural size even with flex-1, so the canvas's own content
                height (thousands of px) was stretching <main> to match
                instead of <main> capping the canvas to the viewport. Real
                bug: traced directly to the h-full change that fixed the
                black-gap-before-footer bug earlier this session -- that
                fix needed a definite height to resolve against, and
                without min-h-0 here, "definite" silently became
                "content-sized" instead of "viewport-sized," collapsing
                the canvas's own pannable range to almost nothing. */}
            <main className="flex-1 min-h-0 w-full">
              {children}
            </main>
            <Footer />
            <AgentChat />
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
