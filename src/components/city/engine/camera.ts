import { Vector3, type OrthographicCamera } from 'three';

/**
 * Isometric orthographic camera, seen from the south and slightly from the
 * east: north up and the sea on the right, like the city map.
 */
export const VIEW = 30;
export const OFFSET = new Vector3(11, 24, 35.1);
export const SCREEN_RIGHT = new Vector3(OFFSET.z, 0, -OFFSET.x).normalize();
export const SCREEN_UP = new Vector3(-OFFSET.x, 0, -OFFSET.z).normalize();

export interface CameraGoal {
  target: Vector3;
  zoom: number;
}

/** Fits the frustum to the viewport: wider than tall keeps VIEW units of height. */
export function fitFrustum(cam: OrthographicCamera, width: number, height: number) {
  const a = width / height;
  const v = a < 1 ? Math.max(VIEW * 1.35, 26 / a) : VIEW;
  cam.left = (-v * a) / 2;
  cam.right = (v * a) / 2;
  cam.top = v / 2;
  cam.bottom = -v / 2;
  cam.updateProjectionMatrix();
}

/** Resting view: shifted so the hero panel does not cover the old town. */
export function homeGoal(center: Vector3, width: number, out: CameraGoal): CameraGoal {
  out.target.copy(center);
  if (width >= 900) out.target.addScaledVector(SCREEN_RIGHT, -6);
  else if (width < 700)
    out.target.addScaledVector(SCREEN_RIGHT, 2.4).addScaledVector(SCREEN_UP, 10);
  out.zoom = 1;
  return out;
}

/** Close-up of a landmark, leaving room for the detail sheet. */
export function focusGoal(
  anchor: Vector3,
  cam: OrthographicCamera,
  width: number,
  out: CameraGoal,
): CameraGoal {
  out.target.set(anchor.x, 1, anchor.z);
  const narrow = width < 700;
  const vh = cam.top - cam.bottom;
  out.zoom = narrow ? vh / 15 : 2.6;
  if (!narrow) out.target.addScaledVector(SCREEN_RIGHT, ((VIEW * 0.17) / out.zoom) * 2);
  else out.target.addScaledVector(SCREEN_UP, ((-vh / out.zoom) * 0.25) / 0.546);
  return out;
}
