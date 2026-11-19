import { Fragment } from 'react';

import { Monogram } from '@/components/brand/Monogram';
import { getContent, type Locale } from '@/content';
import { Link } from '@/i18n/navigation';

import { InnerPagesOnly } from './InnerPagesOnly';
import { LocaleSwitcher } from './LocaleSwitcher';
import { getSiteNav } from './nav';
import { NavLink } from './NavLink';
import { ServicesMenu } from './ServicesMenu';
import { SiteMenu } from './SiteMenu';

/**
 * Header of the inner pages: a floating glass bar, like the panels over the
 * city. Desktop shows the navigation inline; below `lg` it collapses into
 * the menu dialog. The home does not render it: its brand chip floats over
 * the city instead (`HomeBrandChip`). `always` skips that check, for documents
 * rendered outside the `[locale]` layout (the root 404).
 */
export function SiteHeader({ locale, always = false }: { locale: Locale; always?: boolean }) {
  const nav = getSiteNav(locale);
  const { siteName } = getContent(locale).meta;
  const Wrapper = always ? Fragment : InnerPagesOnly;

  return (
    <Wrapper>
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
        <div className="mx-auto flex max-w-6xl items-center gap-3 glass py-2 pr-2 pl-2.5">
          <Link
            href={nav.home.href}
            aria-label={nav.home.label}
            className="flex items-center gap-2.5 rounded-[10px] no-underline"
          >
            <Monogram className="size-8 shrink-0" />
            <span className="font-display text-[15px] leading-none font-extrabold tracking-[0.06em] uppercase">
              {siteName}
            </span>
          </Link>

          <nav aria-label={nav.label} className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              <li>
                <ServicesMenu label={nav.services.label} items={nav.services.items} />
              </li>
              {nav.links.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} className="nav-link">
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden lg:block">
            <LocaleSwitcher className="nav-link font-mono text-xs" />
          </div>

          <div className="ml-auto hidden sm:block lg:ml-0">
            <NavLink href={nav.cta.href} className="btn-primary py-2 text-sm">
              {nav.cta.label}
            </NavLink>
          </div>

          <SiteMenu nav={nav} className="max-sm:ml-auto lg:hidden" />
        </div>
      </header>
    </Wrapper>
  );
}

/**
 * Brand chip of the home, inside the city's top bar: monogram, name,
 * coordinates and the menu button. Keeps the city full screen.
 */
export function HomeBrandChip({ locale }: { locale: Locale }) {
  const nav = getSiteNav(locale);
  const content = getContent(locale);

  return (
    <header className="flex min-w-0 items-center gap-2.5 glass py-2 pr-2 pl-2.5">
      <Monogram className="size-8 shrink-0" />
      <div className="grid min-w-0 gap-0.5">
        <p className="font-display text-[15px] leading-none font-extrabold tracking-[0.06em] uppercase">
          {content.meta.siteName}
        </p>
        <p className="truncate font-mono text-[11px] leading-tight text-text-muted">
          {content.home.city.ui.coordinates}
        </p>
      </div>
      <SiteMenu nav={nav} />
    </header>
  );
}
