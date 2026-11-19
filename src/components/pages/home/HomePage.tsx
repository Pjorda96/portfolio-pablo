import { CityExperience } from '@/components/city/CityExperience';
import type { PlacePageLinks } from '@/components/city/ui/PlaceSheet';
import { HomeBrandChip } from '@/components/layout/SiteHeader';
import { getContent, type Locale } from '@/content';
import { getCityCopy } from '@/content/site';

import { HomeSections, SERVICE_PLACES } from './HomeSections';

/** Fragment id of the content below the city, target of the city's skip link and scroll cue. */
const PLACES_ID = 'lugares';

/** Where each place of the city leads: its own page, and the contact form as the one CTA. */
function placePageLinks(locale: Locale): PlacePageLinks {
  const { meta, home } = getContent(locale);
  const { routes } = meta;
  return {
    contact: routes.contact,
    places: {
      [SERVICE_PLACES.web]: { href: routes.services.web, label: home.services.linkLabel },
      [SERVICE_PLACES.ai]: { href: routes.services.ai, label: home.services.linkLabel },
      [SERVICE_PLACES.apps]: { href: routes.services.apps, label: home.services.linkLabel },
      mercado: { href: routes.casePixelYPapel, label: home.featuredCase.link.label },
      torre: { href: routes.about, label: meta.nav.about },
    },
  };
}

/**
 * Home: the city (client, progressive) over server-rendered content. The
 * brand, the hero and every section below are plain HTML, complete for
 * crawlers and for visitors without JavaScript or WebGL. Each place of the
 * dock lands on the section that stands for it; with the city running, its
 * sheet leads to the place's page and to the contact form.
 */
export function HomePage({ locale }: { locale: Locale }) {
  const copy = getCityCopy(locale);
  const { hero } = copy;

  return (
    <>
      <a
        href={`#${PLACES_ID}`}
        className="sr-only z-50 glass px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {copy.ui.skipLink}
      </a>

      <CityExperience
        copy={copy}
        header={<HomeBrandChip locale={locale} />}
        pageLinks={placePageLinks(locale)}
        hero={
          <div className="grid max-w-[520px] gap-3 glass px-[22px] pt-[22px] pb-5 max-[700px]:p-4">
            <p className="kicker">{hero.kicker}</p>
            <h1 className="font-display text-[clamp(28px,3.9vw,46px)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance break-words hyphens-none">
              {hero.title}
            </h1>
            <p className="max-w-[44ch] text-text-muted max-[700px]:hidden">{hero.lead}</p>
            <p className="font-mono text-xs text-text-muted">{hero.hint}</p>
          </div>
        }
      />

      <div id={PLACES_ID} className="scroll-mt-4">
        <HomeSections locale={locale} />
      </div>
    </>
  );
}
