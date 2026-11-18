import { hourFromDate, wrapHour } from '@/lib/time-of-day';

export type TimeMode = 'real' | 'play' | 'manual';

export interface TimeState {
  hour: number;
  mode: TimeMode;
}

export interface TimeStore {
  getState(): TimeState;
  subscribe(listener: () => void): () => void;
  /** Follow the visitor's clock (refreshed every 20 s). */
  setReal(): void;
  /** Toggle the 24-second day. */
  togglePlay(): void;
  /** A chosen hour; stops real time and playback. */
  setHour(hour: number): void;
  dispose(): void;
}

interface Options {
  now?: () => Date;
  /** Playback in whole-hour steps instead of a continuous sweep. */
  reducedMotion?: () => boolean;
}

/** One hour of city time per second of playback: a day in 24 s. */
const PLAY_SPEED = 1;
const REAL_REFRESH_MS = 20_000;

/**
 * External store for the city's hour. The clock UI subscribes with
 * useSyncExternalStore; the 3D scene reads it every frame without
 * re-rendering React.
 */
export function createTimeStore({
  now = () => new Date(),
  reducedMotion = () => false,
}: Options = {}): TimeStore {
  let state: TimeState = { hour: hourFromDate(now()), mode: 'real' };
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setInterval> | null = null;
  let raf = 0;

  const emit = (next: TimeState) => {
    state = next;
    for (const l of listeners) l();
  };

  const stopTicking = () => {
    if (timer) clearInterval(timer);
    timer = null;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const startPlay = () => {
    if (reducedMotion()) {
      timer = setInterval(
        () => emit({ ...state, hour: wrapHour(Math.floor(state.hour) + 1) }),
        1000,
      );
      return;
    }
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      emit({ ...state, hour: wrapHour(state.hour + dt * PLAY_SPEED) });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  const setReal = () => {
    stopTicking();
    emit({ hour: hourFromDate(now()), mode: 'real' });
    timer = setInterval(() => emit({ hour: hourFromDate(now()), mode: 'real' }), REAL_REFRESH_MS);
  };

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      // Ticking only runs while somebody listens.
      if (listeners.size === 1 && !timer && !raf) {
        if (state.mode === 'real') setReal();
        else if (state.mode === 'play') startPlay();
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) stopTicking();
      };
    },
    setReal,
    togglePlay() {
      stopTicking();
      if (state.mode === 'play') {
        emit({ ...state, mode: 'manual' });
      } else {
        emit({ ...state, mode: 'play' });
        startPlay();
      }
    },
    setHour(hour) {
      stopTicking();
      emit({ hour: wrapHour(hour), mode: 'manual' });
    },
    dispose() {
      stopTicking();
      listeners.clear();
    },
  };
}
