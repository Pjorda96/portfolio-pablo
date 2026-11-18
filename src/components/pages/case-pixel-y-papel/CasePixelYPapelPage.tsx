import type { CaseStudyContent, Locale } from '@/content';

import { CtaSection } from '../shared/CtaSection';
import { PageIntro } from '../shared/PageIntro';

interface CasePixelYPapelPageProps {
  locale: Locale;
  content: CaseStudyContent;
}

/**
 * Píxel y Papel case study. F3 skeleton: hero and closing CTA. Body still to
 * build from `facts`, `context`, `challenge`, `solution`, `role`, `result`,
 * `stack` and `link`.
 */
export function CasePixelYPapelPage({ content }: CasePixelYPapelPageProps) {
  return (
    <>
      <PageIntro kicker={content.hero.kicker} title={content.hero.title} lead={content.hero.lead} />
      <CtaSection cta={content.cta} />
    </>
  );
}
