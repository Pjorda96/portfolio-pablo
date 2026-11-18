import type { ReactNode } from 'react';

interface ContentSectionProps {
  /** Id of the section's `h2`; the section is labelled by it. */
  id: string;
  title: string;
  /** Short line under the title. */
  intro?: string;
  children: ReactNode;
}

/**
 * One block of an inner page body: an `h2` (with an optional intro) beside its
 * content on wide screens, stacked on small ones. Sections are divided by a
 * hairline so long pages read as a sequence of streets, not one wall of text.
 */
export function ContentSection({ id, title, intro, children }: ContentSectionProps) {
  return (
    <section aria-labelledby={id} className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="grid gap-6 border-t border-line py-12 sm:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
        <div className="grid content-start gap-3">
          <h2
            id={id}
            className="max-w-[20ch] font-display text-[clamp(26px,3.4vw,38px)] leading-[1.05] font-extrabold tracking-[-0.02em] text-balance"
          >
            {title}
          </h2>
          {intro && <p className="max-w-[48ch] text-text-muted">{intro}</p>}
        </div>
        <div className="grid min-w-0 content-start gap-5">{children}</div>
      </div>
    </section>
  );
}

/** Paragraphs of running text, at a comfortable measure. */
export function Prose({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div className="grid max-w-[65ch] gap-4 text-[16px] leading-relaxed">
      {paragraphs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}

/** Bulleted list with the city's diamond markers (as in the home place sheet). */
export function DiamondList({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid max-w-[65ch] gap-3">
      {items.map((item) => (
        <li key={item} className="grid grid-cols-[14px_1fr] gap-3 text-[15.5px]">
          <span aria-hidden="true" className="mt-2 size-1.5 rotate-45 rounded-[1px] bg-accent" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Grid of titled cards (`h3` + text): principles, deliverables, solution pieces. */
export function CardGrid({ items }: { items: readonly { title: string; text: string }[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.title}
          className="grid content-start gap-2 rounded-[14px] border border-line bg-surface p-5"
        >
          <h3 className="font-display text-lg leading-tight font-bold tracking-[-0.01em]">
            {item.title}
          </h3>
          <p className="text-text-muted">{item.text}</p>
        </li>
      ))}
    </ul>
  );
}
