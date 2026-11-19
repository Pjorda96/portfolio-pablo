import { PageTransition } from '@/components/motion/PageTransition';
import type { FaqContent, Locale } from '@/content';

import { SECTION } from '../home/primitives';
import { CtaSection } from '../shared/CtaSection';
import { PageIntro } from '../shared/PageIntro';
import { FaqList } from './FaqList';
import { OpenFaqFromHash } from './OpenFaqFromHash';

interface FaqPageProps {
  locale: Locale;
  content: FaqContent;
}

/**
 * FAQ: every question as a disclosure with its own anchor (`#plazos`).
 * `content.items` (plain-text question and answer) is all the `FAQPage`
 * JSON-LD needs, so it can be built from the same prop in F5.
 */
export function FaqPage({ content }: FaqPageProps) {
  return (
    <PageTransition>
      <PageIntro kicker={content.hero.kicker} title={content.hero.title} lead={content.hero.lead} />
      <section aria-labelledby="faq-list-title" className={`${SECTION} pt-0 sm:pt-0`}>
        <h2 id="faq-list-title" className="sr-only">
          {content.hero.kicker}
        </h2>
        <div className="max-w-3xl">
          <FaqList items={content.items} anchored />
        </div>
        <OpenFaqFromHash />
      </section>
      <CtaSection cta={content.cta} />
    </PageTransition>
  );
}
