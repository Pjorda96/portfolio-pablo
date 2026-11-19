/**
 * Main-thread scheduling for the 3D city. The city is progressive
 * enhancement over the static sky, so it never competes with the first
 * paint, hydration or the visitor's first input: it starts after `load`, on
 * the first sign of engagement (or after a quiet fallback delay), and builds
 * in short slices that yield back to the browser.
 */

/** Events that tell us someone is engaging with the page. */
export const ENGAGEMENT_EVENTS = [
  'pointermove',
  'pointerdown',
  'touchstart',
  'wheel',
  'scroll',
  'keydown',
] as const;

/** Start anyway this long after `load` when nobody has interacted. */
export const START_FALLBACK_MS = 4000;

/** Longest stretch of synchronous build work before yielding (ms). */
export const SLICE_BUDGET_MS = 12;

interface SchedulerLike {
  yield?: () => Promise<void>;
}

/**
 * Lets the browser handle input and paint before continuing. Uses
 * `scheduler.yield()` where available (keeps the continuation's priority),
 * otherwise a macrotask.
 */
export function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: SchedulerLike }).scheduler;
  if (typeof scheduler?.yield === 'function') return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function onIdle(cb: () => void, timeout: number): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(cb, 50);
  return () => clearTimeout(id);
}

/**
 * Calls `start` once the page has loaded and either the visitor engages with
 * it or `fallbackMs` pass, then waits for an idle period so the work never
 * lands inside an input handler. Returns a cancel function.
 */
export function whenCityShouldStart(
  start: () => void,
  { fallbackMs = START_FALLBACK_MS }: { fallbackMs?: number } = {},
): () => void {
  let cancelled = false;
  const cleanups: (() => void)[] = [];
  const cancel = () => {
    cancelled = true;
    for (const c of cleanups.splice(0)) c();
  };

  let triggered = false;
  const trigger = () => {
    if (triggered || cancelled) return;
    triggered = true;
    for (const c of cleanups.splice(0)) c();
    cleanups.push(
      onIdle(() => {
        if (!cancelled) start();
      }, 1000),
    );
  };

  const afterLoad = () => {
    if (cancelled) return;
    const opts: AddEventListenerOptions = { passive: true, capture: true };
    for (const type of ENGAGEMENT_EVENTS) window.addEventListener(type, trigger, opts);
    const timer = setTimeout(trigger, fallbackMs);
    cleanups.push(() => {
      for (const type of ENGAGEMENT_EVENTS) window.removeEventListener(type, trigger, opts);
      clearTimeout(timer);
    });
  };

  // Client-side navigation back to the home: the visitor has been around for
  // a while already, so there is nothing to wait for but an idle period.
  if (document.readyState === 'complete' && performance.now() >= fallbackMs) trigger();
  else if (document.readyState === 'complete') afterLoad();
  else {
    window.addEventListener('load', afterLoad, { once: true });
    cleanups.push(() => window.removeEventListener('load', afterLoad));
  }
  return cancel;
}

/**
 * Drives a step generator, yielding to the main thread whenever the current
 * slice has used up its budget. Rejects with an AbortError when aborted.
 */
export async function runSliced<T>(
  steps: Generator<unknown, T>,
  { signal, budgetMs = SLICE_BUDGET_MS }: { signal?: AbortSignal; budgetMs?: number } = {},
): Promise<T> {
  let sliceStart = performance.now();
  for (;;) {
    if (signal?.aborted) throw new DOMException('City build aborted', 'AbortError');
    const r = steps.next();
    if (r.done) return r.value;
    if (performance.now() - sliceStart >= budgetMs) {
      await yieldToMain();
      sliceStart = performance.now();
    }
  }
}
