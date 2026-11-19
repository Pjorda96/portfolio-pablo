import type { MetadataRoute } from 'next';

import { sitemapEntries } from '@/lib/seo';

/** Static: generated once per build, so `lastModified` is the build time. */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(new Date());
}
