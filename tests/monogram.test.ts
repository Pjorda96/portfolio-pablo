import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { MONOGRAM } from '@/components/brand/monogram-shape';

describe('app icon', () => {
  const svg = readFileSync(join(process.cwd(), 'src/app/icon.svg'), 'utf8');

  it('draws the same monogram as the React component', () => {
    expect(svg).toContain(
      `<rect width="${MONOGRAM.size}" height="${MONOGRAM.size}" rx="${MONOGRAM.radius}" fill="${MONOGRAM.background}"/>`,
    );
    for (const r of MONOGRAM.rects) {
      expect(svg).toContain(
        `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${MONOGRAM[r.tone]}"/>`,
      );
    }
    expect(svg.match(/<rect /g)).toHaveLength(MONOGRAM.rects.length + 1);
  });
});
