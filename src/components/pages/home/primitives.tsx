import type { ReactNode } from 'react';

import { REVEAL } from '@/components/motion/reveal';

/**
 * Small building blocks shared by the home, About and FAQ bodies. They mirror
 * the city interface: mono kickers, Syne headings, quiet cards over the
 * ground colour and the accent diamond as bullet.
 */

/** Horizontal rhythm of every content section; it fades in as it scrolls into view. */
export const SECTION = `${REVEAL} mx-auto grid max-w-6xl scroll-mt-4 gap-10 px-4 py-16 sm:px-6 sm:py-20`;

/** Quiet card, the same surface as the city's places. */
export const CARD = 'rounded-[14px] border border-line bg-surface p-6';

/** Inline text link of the body: accent colour, underline on hover. */
export const TEXT_LINK =
  'inline-flex items-center gap-1.5 font-semibold text-accent-strong underline-offset-4 hover:underline';

interface SectionHeadingProps {
  id: string;
  kicker?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}

/** `h2` of a section plus its kicker and intro; `id` labels the section. */
export function SectionHeading({ id, kicker, title, intro, children }: SectionHeadingProps) {
  return (
    <div className="grid max-w-2xl gap-3">
      {kicker && <p className="kicker">{kicker}</p>}
      <h2
        id={id}
        className="font-display text-[clamp(30px,4.2vw,46px)] leading-[1.04] font-extrabold tracking-[-0.02em] text-balance"
      >
        {title}
      </h2>
      {intro && <p className="text-lg text-text-muted">{intro}</p>}
      {children}
    </div>
  );
}

/** List with the accent diamond of the city's sheets as bullet. */
export function DiamondList({
  items,
  className = '',
}: {
  items: readonly string[];
  className?: string;
}) {
  return (
    <ul className={`grid gap-2 ${className}`}>
      {items.map((t) => (
        <li key={t} className="grid grid-cols-[14px_1fr] gap-2 text-[14.5px]">
          <span aria-hidden="true" className="mt-2 size-1.5 rotate-45 rounded-[1px] bg-accent" />
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Arrow after a text link; decorative. */
export function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
