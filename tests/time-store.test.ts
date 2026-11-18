import { afterEach, describe, expect, it, vi } from 'vitest';

import { createTimeStore } from '@/components/city/time-store';

describe('time store', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts on the visitor’s clock and refreshes it', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 8, 30));
    const store = createTimeStore();
    const unsubscribe = store.subscribe(() => {});

    expect(store.getState()).toEqual({ hour: 8.5, mode: 'real' });
    vi.setSystemTime(new Date(2026, 0, 1, 9, 0));
    vi.advanceTimersByTime(20_000);
    expect(store.getState().hour).toBe(9);

    unsubscribe();
    store.dispose();
  });

  it('switches to a manual hour from the slider and back to real time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 22, 0));
    const store = createTimeStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setHour(24);
    expect(store.getState()).toEqual({ hour: 0, mode: 'manual' });
    expect(listener).toHaveBeenCalled();

    store.setReal();
    expect(store.getState()).toEqual({ hour: 22, mode: 'real' });
    store.dispose();
  });

  it('plays a day in whole hours under reduced motion', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 23, 10));
    const store = createTimeStore({ reducedMotion: () => true });
    store.subscribe(() => {});

    store.togglePlay();
    expect(store.getState().mode).toBe('play');
    vi.advanceTimersByTime(1000);
    expect(store.getState().hour).toBe(0);
    vi.advanceTimersByTime(2000);
    expect(store.getState().hour).toBe(2);

    store.togglePlay();
    expect(store.getState().mode).toBe('manual');
    vi.advanceTimersByTime(5000);
    expect(store.getState().hour).toBe(2);
    store.dispose();
  });
});
