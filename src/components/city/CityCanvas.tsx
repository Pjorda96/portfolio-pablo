'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { OrthographicCamera } from 'three';

import type { PlaceId } from '@/content/site';

import { CityController, type ControllerCallbacks } from './engine/controller';
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
 * is complete without it.
 */
export default function CityCanvas({ active, reducedMotion, ...scene }: CityCanvasProps) {
  const [camera] = useState(() => {
    const cam = new OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
    // Tell R3F the frustum is ours: it would otherwise size it in pixels.
    Object.assign(cam, { manual: true });
    return cam;
  });

  return (
    <Canvas
      camera={camera}
      orthographic
      dpr={[1, 2]}
      shadows="percentage"
      // Paused off screen; on demand only when motion is reduced.
      frameloop={!active ? 'never' : reducedMotion ? 'demand' : 'always'}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <CityScene reducedMotion={reducedMotion} {...scene} />
    </Canvas>
  );
}

function CityScene({
  store,
  focused,
  reducedMotion,
  onSelect,
  onBackgroundClick,
  onHover,
  placePin,
  onReady,
}: Omit<CityCanvasProps, 'active'>) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const invalidate = useThree((s) => s.invalidate);

  const [controller] = useState(
    () =>
      new CityController(gl, camera as OrthographicCamera, {
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

  // Add the city to the scene; free the GPU on unmount.
  useEffect(() => {
    controller.attach(scene);
    return () => {
      controller.detach(scene);
      controller.dispose();
    };
  }, [controller, scene]);

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
