import { OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og/copy';
import { ogImage, ogImageAlt, ogStaticParams } from '@/lib/og/route';

/** Social image of this page, one per locale, prerendered at build time. */
export const alt = ogImageAlt('web');
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const generateStaticParams = ogStaticParams;
export default ogImage('web');
