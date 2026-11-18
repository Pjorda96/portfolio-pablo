import type { ContactContent, Locale } from '@/content';

import { PageIntro } from '../shared/PageIntro';

interface ContactPageProps {
  locale: Locale;
  content: ContactContent;
}

/**
 * Contact: the single conversion point of the site. F3 skeleton: hero only.
 * Still to build: `nextSteps`, the `form` (Resend + Zod + rate limit +
 * anti-spam) and the `privacyNotice` under it.
 */
export function ContactPage({ content }: ContactPageProps) {
  return (
    <PageIntro kicker={content.hero.kicker} title={content.hero.title} lead={content.hero.lead} />
  );
}
