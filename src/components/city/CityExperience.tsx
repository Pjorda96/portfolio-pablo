'use client';

import dynamic from 'next/dynamic';
import {
  Component,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { placeById, ui, type PlaceId } from '@/content/site';
import { colorAt, SKY_STOPS, uiModeOf } from '@/lib/time-of-day';

import { createTimeStore } from './time-store';
import { Clock } from './ui/Clock';
import { Dock } from './ui/Dock';
import { Pins } from './ui/Pins';
import { PlaceSheet } from './ui/PlaceSheet';
import { SkyFallback } from './ui/SkyFallback';

// WebGL never renders on the server, and its chunk (three.js) only loads
// once the page is idle, so it never competes with the LCP.
const CityCanvas = dynamic(() => import('./CityCanvas'), { ssr: false });

type WebglSupport = 'unknown' | 'yes' | 'no';

let webglCache: WebglSupport | null = null;
function detectWebgl(): WebglSupport {
  if (webglCache) return webglCache;
  try {
    const c = document.createElement('canvas');
    webglCache = c.getContext('webgl2') || c.getContext('webgl') ? 'yes' : 'no';
  } catch {
    webglCache = 'no';
  }
  return webglCache;
}
const noopSubscribe = () => () => {};

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

/** Catches WebGL context or shader failures and falls back to the static sky. */
class CanvasBoundary extends Component<
  { children: ReactNode; onError(): void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface CityExperienceProps {
  /** Brand block, server-rendered. */
  header: ReactNode;
  /** Hero with the page's h1, server-rendered. */
  hero: ReactNode;
}

/**
 * First screen of the home page: the city and its HTML interface (clock,
 * dock, detail sheet, pins). Everything here is server-rendered except the
 * canvas, which is progressive enhancement over the static sky.
 */
export function CityExperience({ header, hero }: CityExperienceProps) {
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const webgl = useSyncExternalStore(noopSubscribe, detectWebgl, () => 'unknown' as const);
  const [store] = useState(() =>
    createTimeStore({
      reducedMotion: () => typeof window !== 'undefined' && getReducedMotion(),
    }),
  );
  const [focused, setFocused] = useState<PlaceId | null>(null);
  const [shown, setShown] = useState<PlaceId | null>(null);
  const [hovered, setHovered] = useState<PlaceId | null>(null);
  const [mountCanvas, setMountCanvas] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

  const stageRef = useRef<HTMLElement>(null);
  const pins = useRef<Partial<Record<PlaceId, HTMLElement | null>>>({});
  const links = useRef<Partial<Record<PlaceId, HTMLAnchorElement | null>>>({});
  const sheetHeading = useRef<HTMLHeadingElement>(null);
  const moveFocusToSheet = useRef(false);

  // The UI palette and the static sky follow the city's hour. Layout effect:
  // React's dev remount resets <html> attributes the boot script had set.
  useLayoutEffect(() => {
    const root = document.documentElement;
    let mode = '';
    const sync = () => {
      const { hour } = store.getState();
      const next = uiModeOf(hour);
      if (next !== mode) root.setAttribute('data-mode', (mode = next));
      root.style.setProperty('--sky', colorAt(SKY_STOPS, hour));
    };
    sync();
    return store.subscribe(sync);
  }, [store]);

  useEffect(() => () => store.dispose(), [store]);

  // Load the 3D city once the browser is idle.
  useEffect(() => {
    if (webgl !== 'yes') return;
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setMountCanvas(true), { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setMountCanvas(true), 300);
    return () => clearTimeout(id);
  }, [webgl]);

  // Pause rendering while the stage is off screen or the tab is hidden.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(!!entry?.isIntersecting));
    io.observe(el);
    const onVisibility = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const open = useCallback((id: PlaceId, fromKeyboard = false) => {
    moveFocusToSheet.current = fromKeyboard;
    setFocused(id);
    setShown(id);
  }, []);

  const close = useCallback(() => {
    // Hand focus back to the dock link when it was inside the closing sheet.
    const sheet = sheetHeading.current?.closest('aside');
    if (focused && sheet?.contains(document.activeElement)) links.current[focused]?.focus();
    setFocused(null);
  }, [focused]);

  const onSelect = useCallback((id: PlaceId) => open(id), [open]);
  const onBackgroundClick = useCallback(() => setFocused(null), []);
  const onReady = useCallback(() => setReady(true), []);
  // Called by the canvas every frame: moves pins without re-rendering React.
  const placePin = useCallback((id: PlaceId, x: number, y: number) => {
    const el = pins.current[id];
    if (el) el.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`;
  }, []);

  useEffect(() => {
    if (focused && moveFocusToSheet.current) {
      moveFocusToSheet.current = false;
      sheetHeading.current?.focus({ preventScroll: true });
    }
  }, [focused]);

  useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focused, close]);

  const cityRunning = ready && !failed;
  const unsupported = webgl === 'no' || failed;
  const announcement = focused
    ? ui.sheet.announce(placeById(focused).landmark, placeById(focused).title)
    : '';

  return (
    <section
      ref={stageRef}
      aria-label={ui.stageLabel}
      className="relative isolate h-dvh min-h-[560px] overflow-hidden"
    >
      <SkyFallback />

      {mountCanvas && !failed && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: ready ? 1 : 0 }}
        >
          <CanvasBoundary onError={() => setFailed(true)}>
            <CityCanvas
              store={store}
              focused={focused}
              reducedMotion={reducedMotion}
              active={onScreen && pageVisible}
              placePin={placePin}
              onSelect={onSelect}
              onBackgroundClick={onBackgroundClick}
              onHover={setHovered}
              onReady={onReady}
            />
          </CanvasBoundary>
        </div>
      )}

      <Pins pins={pins} hovered={hovered} focused={focused} visible={cityRunning} />

      <div className="pointer-events-none absolute inset-0 grid grid-rows-[auto_1fr_auto] gap-4 p-[max(16px,env(safe-area-inset-top,0px))_max(16px,env(safe-area-inset-right,0px))_max(16px,env(safe-area-inset-bottom,0px))_max(16px,env(safe-area-inset-left,0px))] *:pointer-events-auto">
        <div className="pointer-events-none flex items-start justify-between gap-3 *:pointer-events-auto">
          {header}
          <Clock store={store} />
        </div>

        <div
          className="self-center justify-self-start transition-[opacity,translate] duration-400 data-hidden:pointer-events-none data-hidden:-translate-x-4 data-hidden:opacity-0 max-[700px]:self-start"
          data-hidden={focused || undefined}
        >
          {hero}
          {unsupported && (
            <p role="status" className="mt-3 max-w-[470px] glass p-4 text-sm text-text-muted">
              {ui.noWebgl}
            </p>
          )}
        </div>

        <Dock
          focused={focused}
          interactive={cityRunning}
          onOpen={(id) => open(id, true)}
          links={links}
        />
      </div>

      <PlaceSheet
        place={shown}
        open={!!focused}
        headingRef={sheetHeading}
        onClose={close}
        onOpen={(id) => open(id, true)}
      />

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
