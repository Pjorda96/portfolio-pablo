import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Brand fonts for `ImageResponse`, read from the repo (`src/assets/fonts/`,
 * Fontsource Latin subsets, SIL OFL 1.1; licences next to the files). The
 * renderer needs raw font data and does not read woff2, so these are woff
 * copies of the faces `src/app/fonts.ts` self-hosts through next/font. Nothing
 * is fetched at build or request time.
 */

const FONT_DIR = join(process.cwd(), 'src', 'assets', 'fonts');

type Weight = 400 | 500 | 700 | 800;

const FILES: readonly { name: string; file: string; weight: Weight }[] = [
  { name: 'Syne', file: 'syne-latin-700-normal.woff', weight: 700 },
  { name: 'Syne', file: 'syne-latin-800-normal.woff', weight: 800 },
  { name: 'Inter Tight', file: 'inter-tight-latin-400-normal.woff', weight: 400 },
  { name: 'Inter Tight', file: 'inter-tight-latin-500-normal.woff', weight: 500 },
  { name: 'JetBrains Mono', file: 'jetbrains-mono-latin-500-normal.woff', weight: 500 },
];

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: Weight;
  style: 'normal';
}

let cache: Promise<OgFont[]> | undefined;

/** Reads the font files once per process. */
export function loadOgFonts(): Promise<OgFont[]> {
  cache ??= Promise.all(
    FILES.map(async ({ name, file, weight }) => {
      const buf = await readFile(join(FONT_DIR, file));
      const data = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
      return { name, data, weight, style: 'normal' as const };
    }),
  );
  return cache;
}
