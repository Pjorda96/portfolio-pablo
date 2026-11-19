'use client';

import type { RefObject } from 'react';

import type { PlaceId } from '@/content/site';

import { useCityCopy } from '../copy-context';

interface PinsProps {
  pins: RefObject<Partial<Record<PlaceId, HTMLElement | null>>>;
  hovered: PlaceId | null;
  focused: PlaceId | null;
  visible: boolean;
}

/**
 * Labels floating over the six landmarks; the canvas moves them every frame.
 * Decorative for assistive tech: the dock offers the same six places as
 * links, so pins are hidden from the accessibility tree and not focusable.
 */
export function Pins({ pins, hovered, focused, visible }: PinsProps) {
  const { places } = useCityCopy();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {places.map((p) => (
        <div
          key={p.id}
          ref={(el) => {
            pins.current[p.id] = el;
          }}
          data-hot={hovered === p.id || undefined}
          data-dim={(focused && focused !== p.id) || undefined}
          className="group absolute top-0 left-0 flex flex-col items-center gap-1 transition-opacity duration-300 data-dim:opacity-0"
        >
          {/* Phones: a dot instead of the label, which would pile up on a narrow
              screen; the dock below names the six places. */}
          <span className="rounded-full border border-line bg-glass px-[7px] py-1 font-mono text-[11px] leading-none font-semibold tracking-[0.06em] whitespace-nowrap text-text uppercase backdrop-blur-sm group-data-hot:border-transparent group-data-hot:bg-accent-strong group-data-hot:text-accent-ink max-sm:hidden">
            {p.short}
          </span>
          <b className="hidden size-2.5 rounded-full border-2 border-text bg-accent-strong max-sm:block" />
          <i className="h-[18px] w-px bg-text opacity-50" />
        </div>
      ))}
    </div>
  );
}
