import { Monogram } from '@/components/brand/Monogram';
import { getContent, owner, type Locale } from '@/content';
import { paths } from '@/i18n/routing';

import { LocaleSwitcher } from './LocaleSwitcher';
import { NavLink } from './NavLink';
import { ThemeSelector } from './ThemeSelector';

/** Footer of every page: brand, legal links, theme and language. */
export function SiteFooter({ locale }: { locale: Locale }) {
  const { meta } = getContent(locale);
  const legal = [
    { href: paths.legal.notice, label: meta.footer.notice },
    { href: paths.legal.privacy, label: meta.footer.privacy },
    { href: paths.legal.cookies, label: meta.footer.cookies },
  ];

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-text-muted sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid gap-1">
          <p className="flex items-center gap-2 text-text">
            <Monogram className="size-6" />
            <span>
              {meta.siteName} · {owner.domain}
            </span>
          </p>
          <p>
            {meta.jobTitle}. {meta.footer.tagline}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <nav aria-label={meta.footer.legalLabel}>
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {legal.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    className="underline-offset-4 hover:text-text hover:underline aria-[current=page]:text-text"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeSelector />
          <LocaleSwitcher className="font-mono text-xs underline-offset-4 hover:text-text hover:underline" />
        </div>
      </div>
    </footer>
  );
}
