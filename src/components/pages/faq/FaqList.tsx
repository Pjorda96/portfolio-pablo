import type { IdentifiedFaqItem } from '@/content';

interface FaqListProps {
  items: readonly IdentifiedFaqItem[];
  /**
   * Give each question its anchor id (`#plazos`). Only the FAQ page does it,
   * so a teaser on another page never duplicates the ids.
   */
  anchored?: boolean;
}

/**
 * Questions as native disclosures (`<details>`/`<summary>`): keyboard and
 * screen-reader friendly, and they work without JavaScript. Answers are the
 * same plain text that will feed the `FAQPage` JSON-LD.
 */
export function FaqList({ items, anchored = false }: FaqListProps) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <details
            id={anchored ? item.id : undefined}
            className="group scroll-mt-24 rounded-[14px] border border-line bg-surface open:border-accent/50"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-[14px] p-5 font-display text-lg leading-snug font-bold sm:p-6 [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="mt-1 size-4 shrink-0 text-accent-strong transition-transform duration-200 group-open:rotate-45"
              >
                <path
                  d="M8 2v12M2 8h12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <p className="max-w-[68ch] px-5 pb-5 text-text-muted sm:px-6 sm:pb-6">{item.answer}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}
