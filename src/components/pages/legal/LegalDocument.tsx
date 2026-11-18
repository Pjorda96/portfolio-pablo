import NextLink from 'next/link';
import { Fragment, type ReactNode } from 'react';

import { getContent, type LegalContent, type LegalSection, type Locale } from '@/content';

import { PageIntro } from '../shared/PageIntro';
import { getLegalUi, hasPlaceholders, PLACEHOLDER } from './legal-copy';

export type LegalDocumentId = 'notice' | 'privacy' | 'cookies';

interface LegalDocumentProps {
  locale: Locale;
  document: LegalDocumentId;
}

/** In the cookie policy, the table follows the section "What this site uses". */
const COOKIE_TABLE_AFTER = 1;

/**
 * Legal page (notice, privacy, cookies): long-form text at a reading width,
 * the cookie table where it applies, links to the other two documents and,
 * while the owner's data is incomplete, a draft notice with every `{{…}}`
 * placeholder shown as a "pending" marker.
 */
export function LegalDocument({ locale, document }: LegalDocumentProps) {
  const { legal, meta } = getContent(locale);
  const ui = getLegalUi(locale);
  const page = legal[document];
  const isDraft = hasPlaceholders(legal);
  const text = (value: string) => renderPlaceholders(value, ui.pending);

  const related = (
    [
      { id: 'notice', label: meta.footer.notice, href: meta.routes.legal.notice },
      { id: 'privacy', label: meta.footer.privacy, href: meta.routes.legal.privacy },
      { id: 'cookies', label: meta.footer.cookies, href: meta.routes.legal.cookies },
    ] as const
  ).filter((link) => link.id !== document);

  return (
    <>
      <PageIntro title={page.title} lead={page.updated}>
        {isDraft && (
          <p role="note" className="max-w-[60ch] glass px-4 py-3 text-sm">
            {legal.draftNotice}
          </p>
        )}
      </PageIntro>

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <article className="grid max-w-[70ch] gap-10 text-base leading-relaxed">
          {page.sections.map((section, index) => (
            <Fragment key={section.title}>
              <LegalSectionBlock section={section} index={index} text={text} />
              {document === 'cookies' && index === COOKIE_TABLE_AFTER && (
                <CookieTable table={legal.cookies.table} />
              )}
            </Fragment>
          ))}
        </article>

        <nav
          aria-labelledby="legal-related-title"
          className="mt-14 grid max-w-[70ch] gap-3 border-t border-line pt-8"
        >
          <h2 id="legal-related-title" className="kicker">
            {ui.related}
          </h2>
          <ul className="flex flex-wrap gap-3">
            {related.map((link) => (
              <li key={link.id}>
                <NextLink href={link.href} className="btn-secondary">
                  {link.label}
                </NextLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

function LegalSectionBlock({
  section,
  index,
  text,
}: {
  section: LegalSection;
  index: number;
  text: (value: string) => ReactNode;
}) {
  const id = `seccion-${index + 1}`;
  return (
    <section aria-labelledby={id} className="grid gap-3">
      <h2
        id={id}
        className="font-display text-2xl leading-tight font-extrabold tracking-[-0.02em] text-balance"
      >
        {section.title}
      </h2>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-pretty">
          {text(paragraph)}
        </p>
      ))}
      {section.items.length > 0 && (
        <ul className="grid list-disc gap-2 pl-5 marker:text-accent-strong">
          {section.items.map((item) => (
            <li key={item} className="pl-1 text-pretty">
              {text(item)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CookieTable({ table }: { table: LegalContent['cookies']['table'] }) {
  const columns = ['provider', 'purpose', 'duration', 'kind'] as const;
  return (
    // Scrolls sideways on narrow screens, so it must be focusable for keyboard
    // users to scroll it (WCAG 2.1.1).
    <div
      role="region"
      aria-labelledby="cookie-table-caption"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption id="cookie-table-caption" className="pb-3 text-left font-semibold">
          {table.caption}
        </caption>
        <thead>
          <tr className="border-b-2 border-line">
            <th scope="col" className="py-2 pr-4 font-semibold">
              {table.headers.name}
            </th>
            {columns.map((column) => (
              <th key={column} scope="col" className="py-2 pr-4 font-semibold">
                {table.headers[column]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.name} className="border-b border-line align-top">
              <th scope="row" className="py-3 pr-4 font-mono text-xs font-medium">
                {row.name}
              </th>
              {columns.map((column) => (
                <td key={column} className="py-3 pr-4 text-text-muted">
                  {row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Text with each `{{…}}` placeholder replaced by a visible "pending" marker. */
export function renderPlaceholders(value: string, pendingLabel: string): ReactNode {
  const parts = value.split(PLACEHOLDER);
  if (parts.length === 1) return value;
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark
        key={index}
        data-placeholder={part}
        className="rounded-[6px] border border-dashed border-accent-strong bg-transparent px-1.5 py-0.5 font-mono text-[0.8em] tracking-wide text-accent-strong uppercase"
      >
        {pendingLabel}
      </mark>
    ) : (
      part
    ),
  );
}
