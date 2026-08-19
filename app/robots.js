import { siteConfig } from '@/lib/site';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/work',
    },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
