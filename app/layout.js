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
            <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-16">
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
