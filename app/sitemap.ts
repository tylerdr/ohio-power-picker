import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ohioelectricityrates.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['/', '/compare', '/analytics', '/about'];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.8
  }));
}
