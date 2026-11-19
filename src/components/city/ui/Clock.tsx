'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';

import { formatHour } from '@/lib/time-of-day';

import { useCityCopy } from '../copy-context';
import type { TimeStore } from '../time-store';

const serverSnapshot = () => null;

/**
 * Hour of the city: a dial (range) plus "real time" and "whole day" toggles.
 * On phones it collapses to the time alone, a button that drops the controls
 * down under it, so it fits next to the brand chip.
 */
export function Clock({ store }: { store: TimeStore }) {
  const { ui } = useCityCopy();
  const state = useSyncExternalStore(store.subscribe, store.getState, serverSnapshot);
  const sliderId = useId();
  const controlsId = useId();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Phones: Escape folds the controls back and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const time = state ? formatHour(state.hour) : ui.clock.placeholder;

  return (
    <div role="group" aria-label={ui.clock.label} className="relative shrink-0">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={controlsId}
        aria-label={`${ui.clock.toggle}: ${time}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-[52px] items-center gap-1.5 glass px-3 font-mono text-lg leading-none font-medium tracking-tight tabular-nums max-[380px]:px-2.5 max-[380px]:text-base sm:hidden"
      >
        {time}
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="size-3.5 transition-transform in-aria-expanded:rotate-180"
        >
          <path
            d="M3 6l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        id={controlsId}
        className={`gap-2 glass px-3 py-2.5 max-sm:absolute max-sm:top-full max-sm:right-0 max-sm:z-10 max-sm:mt-2 max-sm:w-[min(280px,calc(100vw-32px))] sm:grid sm:w-[min(300px,40vw)] ${open ? 'grid' : 'hidden'}`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <time
            dateTime={state ? time : undefined}
            className="font-mono text-[22px] leading-none font-medium tracking-tight tabular-nums"
          >
            {time}
          </time>
          <small className="font-mono text-[11px] text-text-muted">
            {state ? ui.clock.modes[state.mode] : ' '}
          </small>
        </div>
        <label htmlFor={sliderId} className="sr-only">
          {ui.clock.slider}
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={24}
          step={0.25}
          value={state?.hour ?? 12}
          aria-valuetext={time}
          disabled={!state}
          onChange={(e) => store.setHour(Number(e.currentTarget.value))}
          className="w-full accent-accent"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            aria-pressed={state?.mode === 'real'}
            onClick={store.setReal}
            disabled={!state}
            className="chip"
          >
            {ui.clock.real}
          </button>
          <button
            type="button"
            aria-pressed={state?.mode === 'play'}
            onClick={store.togglePlay}
            disabled={!state}
            className="chip"
          >
            {ui.clock.play}
          </button>
        </div>
      </div>
    </div>
  );
}
