import type { ReactNode } from 'react';

interface PageIntroProps {
  kicker?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}

/**
 * Opening block of an inner page: kicker, the page's only `h1` and its lead,
 * over a band of the current sky colour, so every page still feels like part
 * of the city.
 */
export function PageIntro({ kicker, title, lead, children }: PageIntroProps) {
  return (
    <div className="-mt-20 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--sky)_55%,transparent),transparent)] pt-20">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 pt-14 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
        {kicker && <p className="kicker">{kicker}</p>}
        <h1 className="max-w-[22ch] font-display text-[clamp(34px,5.2vw,60px)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance">
          {title}
        </h1>
        {lead && <p className="max-w-[60ch] text-lg text-text-muted">{lead}</p>}
        {children}
      </div>
    </div>
  );
}
