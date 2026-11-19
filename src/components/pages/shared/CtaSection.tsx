import NextLink from 'next/link';

import { REVEAL } from '@/components/motion/reveal';
import type { CtaBlock } from '@/content';

/**
 * Closing block of a page. `cta.href` comes from the content tree and is
 * already the public, localized URL of the contact page.
 */
export function CtaSection({ cta }: { cta: CtaBlock }) {
  return (
    <section
      aria-labelledby="cta-title"
      className={`${REVEAL} mx-auto max-w-6xl px-4 py-16 sm:px-6`}
    >
      <div className="grid gap-4 rounded-[14px] border border-line bg-surface p-6 sm:p-10">
        <h2
          id="cta-title"
          className="font-display text-3xl leading-tight font-extrabold tracking-[-0.02em]"
        >
          {cta.title}
        </h2>
        <p className="max-w-[60ch] text-text-muted">{cta.text}</p>
        <p>
          <NextLink href={cta.cta.href} className="btn-primary">
            {cta.cta.label}
          </NextLink>
        </p>
      </div>
    </section>
  );
}
