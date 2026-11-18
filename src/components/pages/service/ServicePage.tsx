import { getContent, getService, SERVICE_IDS, type Locale, type ServiceContent } from '@/content';
import { Link } from '@/i18n/navigation';
import { paths } from '@/i18n/routing';

import { CtaSection } from '../shared/CtaSection';
import { PageIntro } from '../shared/PageIntro';
import { CardGrid, ContentSection, DiamondList, Prose } from './ContentSection';
import { serviceLabels } from './labels';
import { LandmarkSilhouette, SERVICE_PLACE } from './LandmarkSilhouette';

interface ServicePageProps {
  locale: Locale;
  service: ServiceContent;
}

/**
 * Service page, shared by the three services (`getService(locale, id)`):
 * problem, approach, deliverables, process, the service's own FAQ, the other
 * services and the closing CTA. Each service keeps the landmark it has in the
 * home city (La Lonja, the City of Arts and Sciences, La Marina).
 */
export function ServicePage({ locale, service }: ServicePageProps) {
  const labels = serviceLabels[locale];
  const { places } = getContent(locale).home.city;
  const landmark = places[SERVICE_PLACE[service.id]].landmark;
  const related = SERVICE_IDS.filter((id) => id !== service.id).map((id) => getService(locale, id));
  const sid = (part: string) => `${service.id}-${part}`;

  return (
    <>
      <PageIntro kicker={service.hero.kicker} title={service.hero.title} lead={service.hero.lead}>
        <p className="mt-2 flex items-end gap-3 text-text">
          <LandmarkSilhouette service={service.id} className="h-10 w-auto shrink-0 sm:h-12" />
          <span className="pb-1 font-mono text-[11px] tracking-[0.12em] text-text-muted uppercase">
            {landmark} · {labels.city}
          </span>
        </p>
      </PageIntro>

      <ContentSection
        id={sid('problem')}
        title={service.problem.title}
        intro={service.problem.intro}
      >
        <DiamondList items={service.problem.items} />
      </ContentSection>

      <ContentSection id={sid('approach')} title={service.approach.title}>
        <Prose paragraphs={service.approach.paragraphs} />
        <CardGrid items={service.approach.principles} />
      </ContentSection>

      <ContentSection id={sid('deliverables')} title={service.deliverables.title}>
        <CardGrid items={service.deliverables.items} />
      </ContentSection>

      <ContentSection id={sid('process')} title={service.process.title}>
        <ol className="grid gap-3 sm:grid-cols-2">
          {service.process.steps.map((step, i) => (
            <li
              key={step.title}
              className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-[14px] border border-line p-5"
            >
              <span
                aria-hidden="true"
                className="row-span-2 font-mono text-sm leading-[1.6] font-medium text-accent-strong"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-lg leading-tight font-bold tracking-[-0.01em]">
                {step.title}
              </h3>
              <p className="text-text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </ContentSection>

      <ContentSection id={sid('faq')} title={service.faq.title}>
        <div className="max-w-[65ch] border-t border-line">
          {service.faq.items.map((item) => (
            <details key={item.question} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-[6px] py-4 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line text-accent-strong transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                >
                  <svg viewBox="0 0 12 12" className="size-3" focusable="false">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
              </summary>
              <p className="pb-5 text-text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </ContentSection>

      <ContentSection id={sid('related')} title={labels.related} intro={labels.relatedIntro}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {related.map((other) => (
            <li
              key={other.id}
              className="relative grid content-start gap-3 rounded-[14px] border border-line bg-surface p-5 transition-colors focus-within:border-accent hover:border-accent"
            >
              <LandmarkSilhouette service={other.id} className="h-9 w-auto self-start text-text" />
              <p className="font-mono text-[11px] tracking-[0.12em] text-text-muted uppercase">
                {places[SERVICE_PLACE[other.id]].landmark}
              </p>
              <h3 className="font-display text-xl leading-tight font-bold tracking-[-0.01em]">
                <Link
                  href={paths.services[other.id]}
                  className="after:absolute after:inset-0 after:rounded-[14px] after:content-['']"
                >
                  {other.name}
                </Link>
              </h3>
              <p className="text-text-muted">{other.summary.text}</p>
              <p aria-hidden="true" className="text-sm font-semibold text-accent-strong">
                {labels.relatedLink} →
              </p>
            </li>
          ))}
        </ul>
      </ContentSection>

      <CtaSection cta={service.cta} />
    </>
  );
}
