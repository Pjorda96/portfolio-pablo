import type { LegalContent, Locale } from '@/content';

import { PageIntro } from '../shared/PageIntro';

interface LegalDocumentProps {
  locale: Locale;
  /** `legal.notice`, `legal.privacy` or `legal.cookies` (which adds a `table`). */
  page: LegalContent['notice' | 'privacy' | 'cookies'];
  draftNotice: string;
}

/**
 * Legal page (notice, privacy, cookies). F3 skeleton: title, date and the
 * draft notice. Body still to build from `page.sections` (and the cookie
 * `table` when present).
 */
export function LegalDocument({ page, draftNotice }: LegalDocumentProps) {
  return (
    <PageIntro title={page.title} lead={page.updated}>
      <p role="note" className="max-w-[60ch] glass px-4 py-3 text-sm">
        {draftNotice}
      </p>
    </PageIntro>
  );
}
