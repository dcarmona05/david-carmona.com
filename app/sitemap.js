import { siteConfig } from '@/lib/site';

export default function sitemap() {
  const routes = ['', '/about', '/contact'];

  return routes.map((path) => ({
    url: `${siteConfig.siteUrl}${path}`,
    lastModified: new Date(),
  }));
}
