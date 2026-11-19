'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { LocaleSwitcher } from './LocaleSwitcher';
import type { SiteNav } from './nav';
import { NavLink } from './NavLink';
import { ThemeSelector } from './ThemeSelector';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

interface SiteMenuProps {
  nav: SiteNav;
  /** Classes of the toggle button (e.g. `lg:hidden` on inner pages). */
  className?: string;
}

/**
 * Full-screen menu: the whole navigation, the CTA, theme and language. A
 * modal dialog: focus moves into it and is trapped there; Escape or the close
 * button closes it and focus returns to the toggle.
 */
export function SiteMenu({ nav, className = '' }: SiteMenuProps) {
  const t = useTranslations('Menu');
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const titleId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    panel.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      // Focus trap: Tab past the last element wraps to the first, and back.
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    // Following a link (or switching language) closes the menu.
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest('a')) setOpen(false);
    };

    panel.addEventListener('keydown', onKeyDown);
    panel.addEventListener('click', onClick);
    return () => {
      root.style.overflow = previousOverflow;
      panel.removeEventListener('keydown', onKeyDown);
      panel.removeEventListener('click', onClick);
    };
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
        className={`grid size-10 shrink-0 place-items-center rounded-[10px] hover:bg-line ${className}`}
      >
        <span className="sr-only">{t('open')}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5">
          <path
            d="M3 6h14M3 10h14M3 14h14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Portalled to <body>: the glass header's backdrop-filter would otherwise
          become the containing block of this fixed overlay. */}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="fixed inset-0 z-50 overflow-y-auto bg-ground/85 p-4 backdrop-blur-md"
          >
            <div className="mx-auto grid max-w-md gap-6 glass p-5">
              <div className="flex items-center justify-between gap-3">
                <p id={titleId} className="kicker">
                  {t('title')}
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="grid size-10 place-items-center rounded-[10px] hover:bg-line"
                >
                  <span className="sr-only">{t('close')}</span>
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5">
                    <path
                      d="M5 5l10 10M15 5L5 15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <nav aria-label={nav.label} className="grid gap-5">
                <div className="grid gap-2">
                  <p className="font-mono text-[11px] tracking-[0.12em] text-text-muted uppercase">
                    {nav.services.label}
                  </p>
                  <ul className="grid gap-1">
                    {nav.services.items.map((item) => (
                      <li key={item.href}>
                        <NavLink href={item.href} className="menu-link">
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
                <ul className="grid gap-1 border-t border-line pt-4">
                  {nav.links.map((item) => (
                    <li key={item.href}>
                      <NavLink href={item.href} className="menu-link">
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <NavLink href={nav.cta.href} className="btn-primary text-center">
                {nav.cta.label}
              </NavLink>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
                <ThemeSelector />
                <LocaleSwitcher className="underline-offset-4 hover:underline" />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
