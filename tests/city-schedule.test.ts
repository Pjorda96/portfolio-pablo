import { afterEach, describe, expect, it, vi } from 'vitest';

import { canvasPixelRatio, MAX_DPR, MAX_DPR_COARSE } from '@/components/city/pixel-ratio';
import {
  ENGAGEMENT_EVENTS,
  runSliced,
  START_FALLBACK_MS,
  whenCityShouldStart,
  yieldToMain,
} from '@/components/city/schedule';

function setReadyState(state: DocumentReadyState) {
  Object.defineProperty(document, 'readyState', { configurable: true, get: () => state });
}

describe('whenCityShouldStart', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    setReadyState('complete');
  });

  it('waits for load and the first interaction, then an idle period', () => {
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockReturnValue(0);
    setReadyState('loading');
    const start = vi.fn();
    whenCityShouldStart(start);

    window.dispatchEvent(new Event('pointermove'));
    vi.advanceTimersByTime(100);
    expect(start).not.toHaveBeenCalled();

    setReadyState('complete');
    window.dispatchEvent(new Event('load'));
    vi.advanceTimersByTime(START_FALLBACK_MS / 2);
    expect(start).not.toHaveBeenCalled();

    window.dispatchEvent(new Event('pointermove'));
    expect(start).not.toHaveBeenCalled(); // not inside the input handler
    vi.runAllTimers();
    expect(start).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event('scroll'));
    vi.runAllTimers();
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('starts after the fallback delay when nobody interacts', () => {
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockReturnValue(0);
    const start = vi.fn();
    whenCityShouldStart(start);

    vi.advanceTimersByTime(START_FALLBACK_MS - 1);
    expect(start).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('only waits for idle time after a client-side navigation', () => {
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockReturnValue(START_FALLBACK_MS + 1);
    const start = vi.fn();
    whenCityShouldStart(start);
    vi.advanceTimersByTime(200);
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('can be cancelled and leaves no listeners behind', () => {
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockReturnValue(0);
    const remove = vi.spyOn(window, 'removeEventListener');
    const start = vi.fn();
    const cancel = whenCityShouldStart(start);
    cancel();

    for (const type of ENGAGEMENT_EVENTS) window.dispatchEvent(new Event(type));
    vi.runAllTimers();
    expect(start).not.toHaveBeenCalled();
    for (const type of ENGAGEMENT_EVENTS) {
      expect(remove).toHaveBeenCalledWith(type, expect.any(Function), expect.anything());
    }
  });
});

describe('runSliced', () => {
  function* steps(log: number[]) {
    for (let i = 0; i < 5; i++) {
      log.push(i);
      yield;
    }
    return 'done';
  }

  it('runs every step and returns the generator result', async () => {
    const log: number[] = [];
    await expect(runSliced(steps(log), { budgetMs: 0 })).resolves.toBe('done');
    expect(log).toEqual([0, 1, 2, 3, 4]);
  });

  it('yields to the main thread once a slice uses up its budget', async () => {
    const log: number[] = [];
    let macrotasks = 0;
    const tick = setInterval(() => macrotasks++, 0);
    await runSliced(steps(log), { budgetMs: 0 });
    clearInterval(tick);
    expect(macrotasks).toBeGreaterThan(0);
  });

  it('stops when aborted', async () => {
    const log: number[] = [];
    const abort = new AbortController();
    const run = runSliced(steps(log), { signal: abort.signal, budgetMs: 0 });
    abort.abort();
    await expect(run).rejects.toMatchObject({ name: 'AbortError' });
    expect(log.length).toBeLessThan(5);
  });

  it('prefers scheduler.yield() when the browser has it', async () => {
    const yieldFn = vi.fn(() => Promise.resolve());
    vi.stubGlobal('scheduler', { yield: yieldFn });
    await yieldToMain();
    expect(yieldFn).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});

describe('canvasPixelRatio', () => {
  it('caps the pixel ratio, lower on touch devices', () => {
    expect(canvasPixelRatio(1, false)).toBe(1);
    expect(canvasPixelRatio(3, false)).toBe(MAX_DPR);
    expect(canvasPixelRatio(3, true)).toBe(MAX_DPR_COARSE);
    expect(canvasPixelRatio(1.25, true)).toBe(1.25);
  });

  it('never goes below 1 and survives odd values', () => {
    expect(canvasPixelRatio(0.5, false)).toBe(1);
    expect(canvasPixelRatio(Number.NaN, false)).toBe(1);
    expect(canvasPixelRatio(0, true)).toBe(1);
  });
});
