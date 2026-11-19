import Image from 'next/image';

import avatar from '@/assets/avatar.webp';
import {
  getContent,
  getFaqItems,
  SERVICE_IDS,
  type Locale,
  type PlaceId,
  type ServiceId,
} from '@/content';
import { Link } from '@/i18n/navigation';
import { paths } from '@/i18n/routing';

import { FaqList } from '../faq/FaqList';
import { CtaSection } from '../shared/CtaSection';
import { Arrow, CARD, DiamondList, SECTION, SectionHeading, TEXT_LINK } from './primitives';

/** The landmark that stands for each service in the city. */
export const SERVICE_PLACES = {
  web: 'taller',
  ai: 'lab',
  apps: 'puerto',
} as const satisfies Record<ServiceId, PlaceId>;

/**
 * Everything below the city, server-rendered. Each place of the dock lands on
 * the section that stands for it (`home.city.anchors`), and every section
 * leads to its own page. The only call to action is the contact form.
 */
export function HomeSections({ locale }: { locale: Locale }) {
  const c = getContent(locale);
  const { anchors, places } = c.home.city;

  return (
    <>
      <ValueSection locale={locale} anchor={anchors.torre} />
      <ServicesSection locale={locale} />
      <FeaturedCaseSection
        locale={locale}
        anchor={anchors.mercado}
        landmark={places.mercado.landmark}
      />
      <ProcessSection locale={locale} />
      <CapabilitiesSection locale={locale} />
      <FaqTeaserSection locale={locale} />
      <div id={anchors.faro} className="scroll-mt-4">
        <CtaSection cta={c.home.finalCta} />
      </div>
    </>
  );
}

/* ------------------------------------------------------- value proposition */

function ValueSection({ locale, anchor }: { locale: Locale; anchor: string }) {
  const { home, about, meta } = getContent(locale);
  const { value } = home;
  const torre = home.city.places.torre;

  return (
    <section
      id={anchor}
      aria-labelledby="valor-title"
      className={`${SECTION} lg:grid-cols-[1fr_minmax(0,380px)]`}
    >
      <div className="grid content-start gap-8">
        <SectionHeading id="valor-title" title={value.title} intro={value.text} />
        <ul className="grid gap-4 sm:grid-cols-3">
          {value.points.map((p) => (
            <li key={p.title} className="grid content-start gap-2 border-t border-line pt-4">
              <h3 className="font-display text-xl leading-tight font-bold">{p.title}</h3>
              <p className="text-text-muted">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <aside aria-labelledby="valor-sobre-mi" className={`${CARD} grid content-start gap-3`}>
        <Image
          src={avatar}
          alt={about.avatarAlt}
          sizes="96px"
          placeholder="blur"
          className="size-24 rounded-full border border-line bg-surface object-cover"
        />
        <p className="kicker">{torre.landmark}</p>
        <h3 id="valor-sobre-mi" className="font-display text-2xl leading-tight font-bold">
          {meta.jobTitle}
        </h3>
        <p className="text-text-muted">{torre.text}</p>
        <p>
          <Link href={paths.about} className={TEXT_LINK}>
            {meta.nav.about}
            <Arrow />
          </Link>
        </p>
      </aside>
    </section>
  );
}

/* ---------------------------------------------------------------- services */

function ServicesSection({ locale }: { locale: Locale }) {
  const { home, services } = getContent(locale);
  const { anchors, places } = home.city;

  return (
    <section aria-labelledby="servicios-title" className={SECTION}>
      <SectionHeading
        id="servicios-title"
        title={home.services.title}
        intro={home.services.intro}
      />
      <ul className="grid gap-4 lg:grid-cols-3">
        {SERVICE_IDS.map((id) => {
          const service = services.items.find((s) => s.id === id);
          if (!service) return null;
          const place = SERVICE_PLACES[id];
          const titleId = `${anchors[place]}-title`;
          return (
            <li key={id}>
              <article
                id={anchors[place]}
                aria-labelledby={titleId}
                className={`${CARD} grid h-full scroll-mt-4 grid-rows-[auto_auto_auto_1fr_auto] gap-3`}
              >
                <p className="kicker">{places[place].landmark}</p>
                <h3 id={titleId} className="font-display text-2xl leading-tight font-bold">
                  {service.name}
                </h3>
                <p className="text-text-muted">{service.summary.text}</p>
                <DiamondList items={service.summary.points} className="content-start" />
                <p className="pt-2">
                  <Link href={paths.services[id]} className={TEXT_LINK}>
                    {home.services.linkLabel}
                    <span className="sr-only">: {service.name}</span>
                    <Arrow />
                  </Link>
                </p>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ----------------------------------------------------------- featured case */

function FeaturedCaseSection({
  locale,
  anchor,
  landmark,
}: {
  locale: Locale;
  anchor: string;
  landmark: string;
}) {
  const { home, casePixelYPapel } = getContent(locale);
  const { featuredCase } = home;

  return (
    <section id={anchor} aria-labelledby="caso-title" className={SECTION}>
      <div className="grid gap-8 rounded-[14px] border border-line bg-[linear-gradient(135deg,color-mix(in_srgb,var(--sky)_25%,var(--surface)),var(--surface)_70%)] p-6 sm:p-10 lg:grid-cols-[1fr_minmax(0,360px)]">
        <div className="grid content-start gap-4">
          <p className="kicker">
            {featuredCase.kicker} · {landmark}
          </p>
          <h2
            id="caso-title"
            className="font-display text-[clamp(30px,4.2vw,46px)] leading-[1.04] font-extrabold tracking-[-0.02em]"
          >
            {featuredCase.title}
          </h2>
          <p className="max-w-[56ch] text-lg">{featuredCase.text}</p>
          <ul aria-label={casePixelYPapel.stack.title} className="flex flex-wrap gap-2">
            {casePixelYPapel.stack.items.map((t) => (
              <li
                key={t}
                className="rounded-full border border-line px-2.5 py-1 font-mono text-xs text-text-muted"
              >
                {t}
              </li>
            ))}
          </ul>
          <p className="pt-2">
            <Link href={paths.casePixelYPapel} className={TEXT_LINK}>
              {featuredCase.link.label}
              <Arrow />
            </Link>
          </p>
        </div>
        <dl className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {casePixelYPapel.facts.map((f) => (
            <div key={f.label} className="grid gap-1 border-t border-line pt-3">
              <dt className="kicker">{f.label}</dt>
              <dd className="font-semibold">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- process */

function ProcessSection({ locale }: { locale: Locale }) {
  const { process } = getContent(locale).home;

  return (
    <section aria-labelledby="proceso-title" className={SECTION}>
      <SectionHeading id="proceso-title" title={process.title} intro={process.intro} />
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {process.steps.map((s, i) => (
          <li key={s.title} className={`${CARD} grid content-start gap-2`}>
            <span aria-hidden="true" className="font-mono text-sm font-semibold text-accent-strong">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display text-xl leading-tight font-bold">{s.title}</h3>
            <p className="text-text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------ capabilities */

function CapabilitiesSection({ locale }: { locale: Locale }) {
  const { capabilities } = getContent(locale).home;

  return (
    <section aria-labelledby="capacidades-title" className={SECTION}>
      <SectionHeading
        id="capacidades-title"
        title={capabilities.title}
        intro={capabilities.intro}
      />
      <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {capabilities.groups.map((g) => (
          <div key={g.title} className="grid content-start gap-3 border-t border-line pt-4">
            <h3 className="font-display text-lg leading-tight font-bold">{g.title}</h3>
            <ul className="flex flex-wrap gap-2">
              {g.items.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-line bg-surface px-2.5 py-1 text-[13.5px]"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- FAQ teaser */

function FaqTeaserSection({ locale }: { locale: Locale }) {
  const { faqTeaser } = getContent(locale).home;

  return (
    <section
      aria-labelledby="faq-teaser-title"
      className={`${SECTION} lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]`}
    >
      <SectionHeading id="faq-teaser-title" title={faqTeaser.title} intro={faqTeaser.intro}>
        <p className="pt-2">
          <Link href={paths.faq} className={TEXT_LINK}>
            {faqTeaser.link.label}
            <Arrow />
          </Link>
        </p>
      </SectionHeading>
      <FaqList items={getFaqItems(locale, faqTeaser.ids)} />
    </section>
  );
}
