import {
  Raycaster,
  Vector2,
  Vector3,
  type OrthographicCamera,
  type Scene,
  type WebGLRenderer,
} from 'three';

import type { PlaceId } from '@/content/site';

import { buildCity, type CityModel } from './build-city';
import { fitFrustum, focusGoal, homeGoal, OFFSET, SCREEN_RIGHT, type CameraGoal } from './camera';

export interface ControllerCallbacks {
  onSelect(id: PlaceId): void;
  onBackgroundClick(): void;
  onHover(id: PlaceId | null): void;
  /** Screen position (px, relative to the canvas) of a landmark's pin. */
  placePin(id: PlaceId, x: number, y: number): void;
  /** Called once the first frame is on screen. */
  onReady(): void;
  /** Request a frame when the loop runs on demand. */
  invalidate(): void;
}

export interface ControllerOptions {
  focused: PlaceId | null;
  reducedMotion: boolean;
  width: number;
  height: number;
}

/**
 * Imperative runtime of the city: owns the scene graph, the camera rig,
 * picking and the per-frame update. The React layer only feeds it options
 * and forwards R3F's frame callback, which keeps three.js mutation out of
 * React render code.
 */
export class CityController {
  readonly model: CityModel;
  private readonly current: CameraGoal;
  private readonly goal: CameraGoal;
  private readonly parallax = new Vector2();
  private readonly tmp = new Vector3();
  private readonly ray = new Raycaster();
  private readonly ptr = new Vector2();
  private opts: ControllerOptions = { focused: null, reducedMotion: false, width: 1, height: 1 };
  private hovered: PlaceId | null = null;
  private hour = Number.NaN;
  private frames = 0;
  private snap = true;
  private detachDom: (() => void) | null = null;

  constructor(
    private readonly gl: WebGLRenderer,
    private readonly camera: OrthographicCamera,
    private callbacks: ControllerCallbacks,
  ) {
    this.model = buildCity({
      pixelRatio: gl.getPixelRatio(),
      maxAnisotropy: gl.capabilities.getMaxAnisotropy(),
    });
    this.current = { target: this.model.center.clone(), zoom: 1 };
    this.goal = { target: this.model.center.clone(), zoom: 1 };
  }

  setCallbacks(callbacks: ControllerCallbacks) {
    this.callbacks = callbacks;
  }

  /** Frustum and camera goal for the canvas size and the focused landmark. */
  setOptions(opts: ControllerOptions) {
    this.opts = opts;
    fitFrustum(this.camera, opts.width, opts.height);
    if (opts.focused)
      focusGoal(this.model.anchors[opts.focused], this.camera, opts.width, this.goal);
    else homeGoal(this.model.center, opts.width, this.goal);
    if (opts.reducedMotion || this.snap) {
      this.current.target.copy(this.goal.target);
      this.current.zoom = this.goal.zoom;
      this.snap = false;
    }
    this.callbacks.invalidate();
  }

  attach(scene: Scene) {
    this.model.attach(scene);
    const el = this.gl.domElement;
    const move = (e: PointerEvent) => this.pointerMove(e);
    const leave = () => this.setHover(null);
    const click = () => {
      if (this.hovered) this.callbacks.onSelect(this.hovered);
      else this.callbacks.onBackgroundClick();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    el.addEventListener('click', click);
    this.detachDom = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('click', click);
      el.style.cursor = '';
    };
    this.callbacks.invalidate();
  }

  detach(scene: Scene) {
    this.detachDom?.();
    this.detachDom = null;
    this.model.detach(scene);
  }

  dispose() {
    this.model.dispose();
  }

  /** Per-frame update; R3F renders right after it. */
  frame(hour: number, elapsed: number, delta: number) {
    const { model, camera, current, goal, opts } = this;
    if (hour !== this.hour) {
      this.hour = hour;
      model.applyHour(hour);
      this.gl.toneMappingExposure = model.exposure();
    }

    const dt = Math.min(delta, 0.05);
    const k = opts.reducedMotion ? 1 : 1 - Math.pow(0.0025, dt);
    current.target.lerp(goal.target, k);
    current.zoom += (goal.zoom - current.zoom) * k;
    const par = opts.reducedMotion || opts.focused ? 0 : 1;
    camera.position
      .copy(current.target)
      .add(OFFSET)
      .addScaledVector(SCREEN_RIGHT, this.parallax.x * 1.7 * par)
      .add(this.tmp.set(0, this.parallax.y * 0.8 * par, 0));
    camera.lookAt(current.target);
    camera.zoom = current.zoom;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    if (!opts.reducedMotion) model.animate(elapsed, dt);

    for (const [id, anchor] of Object.entries(model.anchors) as [PlaceId, Vector3][]) {
      const p = this.tmp.copy(anchor).project(camera);
      this.callbacks.placePin(id, (p.x * 0.5 + 0.5) * opts.width, (-p.y * 0.5 + 0.5) * opts.height);
    }

    if (++this.frames === 1) this.callbacks.onReady();
  }

  private pointerMove(e: PointerEvent) {
    const r = this.gl.domElement.getBoundingClientRect();
    this.ptr.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    this.parallax.copy(this.ptr);
    this.ray.setFromCamera(this.ptr, this.camera);
    const hit = this.ray.intersectObjects(this.model.pickables, false)[0];
    this.setHover(hit ? (hit.object.userData.place as PlaceId) : null);
  }

  private setHover(id: PlaceId | null) {
    if (id === this.hovered) return;
    this.hovered = id;
    this.gl.domElement.style.cursor = id ? 'pointer' : 'default';
    this.model.setHover(id);
    this.callbacks.onHover(id);
    this.callbacks.invalidate();
  }
}
