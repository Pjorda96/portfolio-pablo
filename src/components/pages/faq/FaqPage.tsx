import type { FaqContent, Locale } from '@/content';

import { CtaSection } from '../shared/CtaSection';
import { PageIntro } from '../shared/PageIntro';

interface FaqPageProps {
  locale: Locale;
  content: FaqContent;
}

/**
 * FAQ. F3 skeleton: hero and closing CTA. Body still to build from `items`
 * (and their `FAQPage` JSON-LD).
 */
export function FaqPage({ content }: FaqPageProps) {
  return (
    <>
      <PageIntro kicker={content.hero.kicker} title={content.hero.title} lead={content.hero.lead} />
      <CtaSection cta={content.cta} />
    </>
  );
}
