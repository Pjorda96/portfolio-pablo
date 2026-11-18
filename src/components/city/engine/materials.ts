import {
  CanvasTexture,
  Color,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  type MeshStandardMaterialParameters,
  type WebGLProgramParametersWithUniforms,
} from 'three';

import type { PlaceId } from '@/content/site';

import type { PartKind } from './kit';
import type { Rng } from './rng';

interface UpUniforms {
  uUp: { value: Color };
  uHover: { value: Color };
}

/**
 * Materials for merged landmark meshes: vertex colours, a warm night uplight
 * that is strongest at street level and fades with height, and a hover tint.
 */
export function kitMat(params: MeshStandardMaterialParameters = {}): MeshStandardMaterial {
  const m = new MeshStandardMaterial({ vertexColors: true, roughness: 0.85, ...params });
  const uniforms: UpUniforms = { uUp: { value: new Color(0) }, uHover: { value: new Color(0) } };
  m.userData = uniforms;
  m.onBeforeCompile = (sh: WebGLProgramParametersWithUniforms) => {
    sh.uniforms.uUp = uniforms.uUp;
    sh.uniforms.uHover = uniforms.uHover;
    sh.vertexShader =
      'varying float vUpY;\n' +
      sh.vertexShader.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n\tvec4 upW = vec4(transformed,1.0);\n#ifdef USE_INSTANCING\n\tupW = instanceMatrix * upW;\n#endif\n\tvUpY = (modelMatrix * upW).y;',
      );
    sh.fragmentShader =
      'varying float vUpY;\nuniform vec3 uUp;\nuniform vec3 uHover;\n' +
      sh.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n\ttotalEmissiveRadiance += uUp * clamp(1.15 - vUpY*0.42, 0.06, 1.15) + uHover;',
      );
  };
  return m;
}

export const uniformsOf = (m: MeshStandardMaterial) => m.userData as UpUniforms;

export interface MatSet {
  place: PlaceId | null;
  up: Color;
  upK: number;
  glowK: number;
  mats: Record<PartKind, MeshStandardMaterial>;
}

export function matSet(
  place: PlaceId | null,
  up: string,
  upK: number,
  glow: string,
  glowK: number,
): MatSet {
  return {
    place,
    up: new Color(up),
    upK,
    glowK,
    mats: {
      body: kitMat(),
      shiny: kitMat({ roughness: 0.28, metalness: 0.15 }),
      glow: kitMat({ roughness: 0.4, emissive: new Color(glow), emissiveIntensity: 0 }),
      blink: kitMat({ emissive: new Color(0xff3b2f), emissiveIntensity: 0 }),
    },
  };
}

export const std = (params: MeshStandardMaterialParameters = {}) =>
  new MeshStandardMaterial({ roughness: 0.9, ...params });

// ---------- procedural facades ----------

/** Facade atlas: FC columns × FR floors of CELL px windows. */
export const FACADE = { FC: 8, FR: 16, CELL: 32, DENS: 3.6, FLOOR: 0.2 } as const;

function facadeTex(rng: Rng, lit: boolean, maxAnisotropy: number): CanvasTexture {
  const { FC, FR, CELL } = FACADE;
  const c = document.createElement('canvas');
  c.width = FC * CELL;
  c.height = FR * CELL;
  const g = c.getContext('2d')!;
  g.fillStyle = lit ? '#000' : '#fff';
  g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < FC; i++) {
    for (let j = 0; j < FR; j++) {
      const x = i * CELL;
      const y = j * CELL;
      if (lit) {
        const r = rng.rnd();
        if (r < 0.38) {
          g.fillStyle = rng.pick([
            '#ffd28a',
            '#ffc070',
            '#ffe0ad',
            '#ffcf86',
            '#ffb766',
            '#cfdcff',
          ]);
          g.fillRect(x + 10, y + 7, 12, 18);
        } else if (r < 0.5) {
          g.fillStyle = '#5a3d1e';
          g.fillRect(x + 10, y + 7, 12, 18);
        }
      } else {
        g.fillStyle = '#ebe6dc';
        g.fillRect(x, y + CELL - 2, CELL, 2);
        g.fillStyle = rng.rnd() < 0.25 ? '#8b8576' : '#666c77';
        g.fillRect(x + 10, y + 7, 12, 18);
        g.fillStyle = '#cfc8bb';
        g.fillRect(x + 7, y + 25, 18, 2);
      }
    }
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.wrapS = t.wrapT = RepeatWrapping;
  t.anisotropy = Math.min(8, maxAnisotropy);
  return t;
}

/**
 * Shared material of the instanced building prisms: a window texture by day,
 * per-building lit windows at night. Each instance picks its own window
 * pattern (aUv) and how many lights are on (aLit).
 */
export function createFacadeMaterials(rng: Rng, maxAnisotropy: number) {
  const facade = new MeshStandardMaterial({
    map: facadeTex(rng, false, maxAnisotropy),
    emissiveMap: facadeTex(rng, true, maxAnisotropy),
    emissive: 0xffffff,
    emissiveIntensity: 0,
    roughness: 0.92,
  });
  facade.onBeforeCompile = (sh) => {
    sh.vertexShader =
      'attribute vec4 aUv;\nattribute float aLit;\nvarying float vLit;\n' +
      sh.vertexShader.replace(
        '#include <uv_vertex>',
        '#include <uv_vertex>\n\tvMapUv = uv * aUv.xy;\n\tvEmissiveMapUv = uv * aUv.xy + aUv.zw;\n\tvLit = aLit;',
      );
    sh.fragmentShader =
      'varying float vLit;\n' +
      sh.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n\ttotalEmissiveRadiance *= vLit;',
      );
  };
  const roof = new MeshStandardMaterial({ color: 0xd8d0c2, roughness: 0.95 });
  return { facade, roof };
}

/** Soft round sprite for street lights, car lights and boat lights. */
export function createGlowSprite(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.22, 'rgba(255,255,255,.9)');
  gr.addColorStop(0.5, 'rgba(255,255,255,.25)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}
