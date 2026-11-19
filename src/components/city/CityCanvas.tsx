'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useState } from 'react';
import { OrthographicCamera } from 'three';

import type { PlaceId } from '@/content/site';

import { buildCitySteps, type CityModel } from './engine/build-city';
import { CityController, type ControllerCallbacks } from './engine/controller';
import { canvasPixelRatio } from './pixel-ratio';
import { runSliced, yieldToMain } from './schedule';
import type { TimeStore } from './time-store';

export interface CityCanvasProps extends Omit<ControllerCallbacks, 'invalidate'> {
  store: TimeStore;
  focused: PlaceId | null;
  reducedMotion: boolean;
  /** False while the tab is hidden or the stage is scrolled out of view. */
  active: boolean;
}

/**
 * The WebGL city. Loaded lazily and client-only by CityExperience; the page
 * is complete without it. Three phases keep the main thread free: the scene
 * is built in short slices (`buildCitySteps` + `runSliced`), then its shaders
 * compile in parallel (`compileAsync`), and only then does the loop start.
 */
export default function CityCanvas({ active, reducedMotion, ...scene }: CityCanvasProps) {
  const [dpr] = useState(() =>
    canvasPixelRatio(window.devicePixelRatio, window.matchMedia('(pointer: coarse)').matches),
  );
  const [camera] = useState(() => {
    const cam = new OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
    // Tell R3F the frustum is ours: it would otherwise size it in pixels.
    Object.assign(cam, { manual: true });
    return cam;
  });
  const [model, setModel] = useState<CityModel | null>(null);
  const [compiled, setCompiled] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const onCompiled = useCallback(() => setCompiled(true), []);

  useEffect(() => {
    const abort = new AbortController();
    let built: CityModel | null = null;
    runSliced(buildCitySteps({ pixelRatio: dpr }), { signal: abort.signal }).then(
      (m) => {
        built = m;
        setModel(m);
      },
      (e: unknown) => {
        if (!abort.signal.aborted) setError(e ?? new Error('City build failed'));
      },
    );
    // Free the GPU once the canvas goes away.
    return () => {
      abort.abort();
      built?.dispose();
    };
  }, [dpr]);

  // Surface async failures to CityExperience's error boundary.
  if (error) throw error;
  if (!model) return null;
  const running = active && compiled;

  return (
    <Canvas
      camera={camera}
      orthographic
      dpr={dpr}
      shadows="percentage"
      // Idle until the shaders are ready; paused off screen; on demand only
      // when motion is reduced.
      frameloop={!running ? 'never' : reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <CityScene
        model={model}
        running={running}
        onCompiled={onCompiled}
        onCompileError={setError}
        reducedMotion={reducedMotion}
        {...scene}
      />
    </Canvas>
  );
}

interface CitySceneProps extends Omit<CityCanvasProps, 'active'> {
  model: CityModel;
  running: boolean;
  onCompiled(): void;
  onCompileError(e: unknown): void;
}

function CityScene({
  model,
  running,
  onCompiled,
  onCompileError,
  store,
  focused,
  reducedMotion,
  onSelect,
  onBackgroundClick,
  onHover,
  placePin,
  onReady,
}: CitySceneProps) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const invalidate = useThree((s) => s.invalidate);

  const [controller] = useState(
    () =>
      new CityController(gl, camera as OrthographicCamera, model, {
        onSelect,
        onBackgroundClick,
        onHover,
        placePin,
        onReady,
        invalidate,
      }),
  );

  useEffect(() => {
    controller.setCallbacks({
      onSelect,
      onBackgroundClick,
      onHover,
      placePin,
      onReady,
      invalidate,
    });
  }, [controller, onSelect, onBackgroundClick, onHover, placePin, onReady, invalidate]);

  // Add the city to the scene and compile its shaders without blocking the
  // main thread (KHR_parallel_shader_compile where available).
  useEffect(() => {
    let live = true;
    controller.attach(scene);
    // A task of its own: generating the shader sources is not free either.
    yieldToMain()
      .then(() => (live ? gl.compileAsync(scene, camera) : null))
      .then(
        () => live && onCompiled(),
        (e: unknown) => live && onCompileError(e),
      );
    return () => {
      live = false;
      controller.detach(scene);
    };
  }, [controller, scene, gl, camera, onCompiled, onCompileError]);

  // Draw the first frame as soon as the loop may run (needed in 'demand' mode).
  useEffect(() => {
    if (running) invalidate();
  }, [running, invalidate]);

  useEffect(() => {
    controller.setOptions({ focused, reducedMotion, width, height });
  }, [controller, focused, reducedMotion, width, height]);

  // Redraw on hour changes when the loop runs on demand (reduced motion).
  useEffect(() => store.subscribe(invalidate), [store, invalidate]);

  useFrame((state, delta) => {
    controller.frame(store.getState().hour, state.clock.elapsedTime, delta);
  });

  return null;
}
