'use client';

import Image from 'next/image';
import NextLink from 'next/link';
import type { RefObject } from 'react';

import avatar from '@/assets/avatar.webp';

import type { PlaceId } from '@/content/site';

import { placeIn, useCityCopy } from '../copy-context';

/** Public, localized URLs (content routes): render them with `next/link`. */
export interface PlacePageLinks {
  /** The contact page: target of the sheet's call to action. */
  contact: string;
  /** Page of each place, with the label of its link. */
  places: Partial<Record<PlaceId, { href: string; label: string }>>;
}

interface PlaceSheetProps {
  /** Place shown; the sheet keeps the last one while it fades out. */
  place: PlaceId | null;
  open: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  /** When given, the sheet leads to the real pages instead of the home sections. */
  pageLinks?: PlacePageLinks;
  onClose(): void;
  onOpen(id: PlaceId): void;
}

/** Detail of the landmark the camera is visiting. */
export function PlaceSheet({
  place,
  open,
  headingRef,
  pageLinks,
  onClose,
  onOpen,
}: PlaceSheetProps) {
  const copy = useCityCopy();
  const { ui } = copy;
  const p = place ? placeIn(copy, place) : null;
  const page = p ? pageLinks?.places[p.id] : undefined;

  return (
    <aside
      aria-labelledby="place-sheet-title"
      inert={!open}
      data-open={open || undefined}
      className="pointer-events-none absolute top-1/2 right-[max(16px,env(safe-area-inset-right,0px))] z-20 grid max-h-[calc(100%-180px)] w-[min(400px,calc(100vw-32px))] translate-x-6 -translate-y-1/2 gap-3 overflow-auto glass p-[22px] opacity-0 transition-[opacity,translate] duration-300 data-open:pointer-events-auto data-open:translate-x-0 data-open:opacity-100 max-[700px]:top-auto max-[700px]:bottom-[max(110px,calc(env(safe-area-inset-bottom,0px)+110px))] max-[700px]:max-h-[52%] max-[700px]:translate-x-0 max-[700px]:translate-y-6 max-[700px]:data-open:translate-y-0"
    >
      {p && (
        <>
          {p.id === 'torre' && (
            <Image
              src={avatar}
              alt={copy.avatarAlt}
              sizes="80px"
              className="size-20 rounded-full border border-line object-cover"
            />
          )}
          <p className="kicker">{p.title}</p>
          <h2
            id="place-sheet-title"
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-[34px] leading-none font-extrabold tracking-[-0.02em] outline-none"
          >
            {p.landmark}
          </h2>
          <p className="text-text-muted">{p.text}</p>
          <ul className="grid gap-2">
            {p.points.map((t) => (
              <li key={t} className="grid grid-cols-[14px_1fr] gap-2 text-[14.5px]">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 rotate-45 rounded-[1px] bg-accent"
                />
                {t}
              </li>
            ))}
          </ul>
          {page && (
            <p>
              <NextLink
                href={page.href}
                className="font-semibold text-accent-strong underline-offset-4 hover:underline"
              >
                {page.label} <span aria-hidden="true">→</span>
              </NextLink>
            </p>
          )}
          <div className="mt-1 flex flex-wrap gap-2">
            {pageLinks ? (
              <NextLink href={pageLinks.contact} className="btn-primary">
                {p.id === 'faro' ? ui.sheet.contactCta : ui.sheet.cta}
              </NextLink>
            ) : p.id === 'faro' ? (
              <a href={`#${p.slug}`} className="btn-primary">
                {ui.sheet.contactCta}
              </a>
            ) : (
              <button type="button" onClick={() => onOpen('faro')} className="btn-primary">
                {ui.sheet.cta}
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-secondary">
              {ui.sheet.back}
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
