import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/**
 * Locale-aware navigation APIs. `Link` takes an internal pathname (the
 * Spanish URL, see `paths` in `./routing`) and renders the public URL of the
 * current locale: `<Link href={paths.about}>` is `/sobre-mi` or `/en/about`.
 *
 * Content hrefs (`content.*.cta.href`, `meta.routes.*`) are already public
 * URLs: render those with `next/link`, not with this `Link`.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
