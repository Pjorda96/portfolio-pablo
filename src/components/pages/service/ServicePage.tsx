import type { ServiceContent, Locale } from '@/content';

import { CtaSection } from '../shared/CtaSection';
import { PageIntro } from '../shared/PageIntro';

interface ServicePageProps {
  locale: Locale;
  service: ServiceContent;
}

/**
 * Service page, shared by the three services (`getService(locale, id)`).
 * F3 skeleton: hero and closing CTA. Body still to build from
 * `service.problem`, `approach`, `deliverables`, `process` and `faq`.
 */
export function ServicePage({ service }: ServicePageProps) {
  return (
    <>
      <PageIntro kicker={service.hero.kicker} title={service.hero.title} lead={service.hero.lead} />
      <CtaSection cta={service.cta} />
    </>
  );
}
