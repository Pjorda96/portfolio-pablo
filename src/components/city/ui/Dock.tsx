'use client';

import type { MouseEvent, RefObject } from 'react';

import type { PlaceId } from '@/content/site';

import { useCityCopy } from '../copy-context';

interface DockProps {
  focused: PlaceId | null;
  /** When the 3D city is running, links fly to the landmark instead of scrolling. */
  interactive: boolean;
  onOpen(id: PlaceId): void;
  links: RefObject<Partial<Record<PlaceId, HTMLAnchorElement | null>>>;
}

/**
 * The six places. Real links to the page sections, so they work without
 * JavaScript or WebGL; with the city running they open the landmark.
 */
export function Dock({ focused, interactive, onOpen, links }: DockProps) {
  const { places, ui } = useCityCopy();
  const handle = (id: PlaceId) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (!interactive || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onOpen(id);
  };

  return (
    <nav
      aria-label={ui.dockLabel}
      className="max-w-full justify-self-center glass p-1.5 max-sm:justify-self-stretch"
    >
      {/* Phones: one row that scrolls sideways, landmark names only. */}
      <ul className="flex flex-wrap justify-center gap-1.5 max-sm:snap-x max-sm:[scrollbar-width:none] max-sm:flex-nowrap max-sm:justify-start max-sm:overflow-x-auto">
        {places.map((p) => (
          <li key={p.id} className="shrink-0 snap-start">
            <a
              ref={(el) => {
                links.current[p.id] = el;
              }}
              href={`#${p.slug}`}
              aria-current={focused === p.id ? 'location' : undefined}
              onClick={handle(p.id)}
              className="grid gap-px rounded-[10px] px-3 py-2 text-left no-underline hover:bg-line aria-[current]:bg-line max-sm:px-2.5 max-sm:py-1.5"
            >
              <b className="font-display text-sm leading-tight font-bold tracking-[0.01em] whitespace-nowrap">
                {p.landmark}
              </b>
              <span className="text-[11.5px] whitespace-nowrap text-text-muted max-sm:hidden">
                {p.short}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
