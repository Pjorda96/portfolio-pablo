import type { MetadataRoute } from 'next';

import { robotsTxt } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return robotsTxt();
}
