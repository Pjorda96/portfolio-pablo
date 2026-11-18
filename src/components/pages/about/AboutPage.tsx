import type { AboutContent, Locale } from '@/content';

import { CtaSection } from '../shared/CtaSection';
import { PageIntro } from '../shared/PageIntro';

interface AboutPageProps {
  locale: Locale;
  content: AboutContent;
}

/**
 * About. F3 skeleton: hero and closing CTA. Body still to build from
 * `intro`, `avatarAlt` (with `@/assets/avatar.webp`), `experience`,
 * `specialties`, `quality` and `working`.
 */
export function AboutPage({ content }: AboutPageProps) {
  return (
    <>
      <PageIntro kicker={content.hero.kicker} title={content.hero.title} lead={content.hero.lead} />
      <CtaSection cta={content.cta} />
    </>
  );
}
