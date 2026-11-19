'use client';

import { useEffect, useId, useRef, useState, type FocusEvent } from 'react';

import type { NavItem } from './nav';
import { NavLink } from './NavLink';

/**
 * "Services" in the desktop header: a disclosure button that reveals the
 * three service pages. Escape, a click outside or tabbing out closes it.
 */
export function ServicesMenu({ label, items }: { label: string; items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative" onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="nav-link inline-flex items-center gap-1"
      >
        {label}
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="size-3 transition-transform in-aria-expanded:rotate-180"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      <ul
        id={listId}
        hidden={!open}
        className="absolute top-[calc(100%+12px)] left-0 grid w-64 gap-1 rounded-[14px] border border-line bg-surface p-2 shadow-lg"
      >
        {items.map((item) => (
          <li key={item.href}>
            <NavLink href={item.href} onClick={() => setOpen(false)} className="menu-link">
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
