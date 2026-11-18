import Image from 'next/image';

import avatar from '@/assets/avatar.webp';
import { Monogram } from '@/components/brand/Monogram';
import { CityExperience } from '@/components/city/CityExperience';
import { hero, places, placesSection, site } from '@/content/site';

/**
 * Home: the city (client, progressive) over server-rendered content. The
 * brand, the hero and the six places are plain HTML, complete for crawlers
 * and for visitors without JavaScript or WebGL.
 */
export default function HomePage() {
  return (
    <>
      <a
        href="#lugares"
        className="sr-only z-50 glass px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {site.skipLink}
      </a>

      <main>
        <CityExperience
          header={
            <header className="flex items-center gap-2.5 glass py-2.5 pr-3.5 pl-2.5">
              <Monogram className="size-8 shrink-0" />
              <div className="grid gap-0.5">
                <p className="font-display text-[15px] leading-none font-extrabold tracking-[0.06em] uppercase">
                  {site.name}
                </p>
                <p className="font-mono text-[11px] leading-tight text-text-muted">
                  {site.coordinates}
                </p>
              </div>
            </header>
          }
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

        <section
          id="lugares"
          aria-labelledby="lugares-title"
          className="mx-auto grid max-w-6xl scroll-mt-4 gap-10 px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="grid max-w-2xl gap-3">
            <h2
              id="lugares-title"
              className="font-display text-4xl leading-none font-extrabold tracking-[-0.02em] sm:text-5xl"
            >
              {placesSection.title}
            </h2>
            <p className="text-lg text-text-muted">{placesSection.intro}</p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {places.map((p) => (
              <li key={p.id}>
                <article
                  id={p.slug}
                  aria-labelledby={`${p.slug}-title`}
                  className="grid h-full scroll-mt-4 content-start gap-3 rounded-[14px] border border-line bg-surface p-6"
                >
                  {p.id === 'torre' && (
                    <Image
                      src={avatar}
                      alt={site.avatarAlt}
                      sizes="112px"
                      placeholder="blur"
                      className="size-28 rounded-full border border-line bg-surface object-cover"
                    />
                  )}
                  <p className="kicker">{p.landmark}</p>
                  <h3
                    id={`${p.slug}-title`}
                    className="font-display text-2xl leading-tight font-bold"
                  >
                    {p.title}
                  </h3>
                  <p className="text-text-muted">{p.text}</p>
                  <ul className="grid gap-2">
                    {p.points.map((t) => (
                      <li key={t} className="grid grid-cols-[14px_1fr] gap-2 text-[14.5px]">
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 rotate-45 rounded-[1px] bg-accent"
                        />
                        {t}
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-text-muted sm:px-6">
          <p className="flex items-center gap-2">
            <Monogram className="size-6" />
            <span>
              {site.name} · {site.domain}
            </span>
          </p>
          <p>{site.footer}</p>
        </div>
      </footer>
    </>
  );
}
