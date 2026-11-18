'use client';

import { useId, useSyncExternalStore } from 'react';

import { formatHour } from '@/lib/time-of-day';

import { useCityCopy } from '../copy-context';
import type { TimeStore } from '../time-store';

const serverSnapshot = () => null;

/** Hour of the city: a dial (range) plus "real time" and "whole day" toggles. */
export function Clock({ store }: { store: TimeStore }) {
  const { ui } = useCityCopy();
  const state = useSyncExternalStore(store.subscribe, store.getState, serverSnapshot);
  const sliderId = useId();
  const time = state ? formatHour(state.hour) : ui.clock.placeholder;

  return (
    <div
      role="group"
      aria-label={ui.clock.label}
      className="grid w-[min(300px,52vw)] gap-2 glass px-3 py-2.5"
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
  );
}
