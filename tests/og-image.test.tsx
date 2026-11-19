// @vitest-environment node
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { LOCALES } from '@/content';
import { OG_PAGES, OG_SIZE } from '@/lib/og/copy';
import { renderOgImage } from '@/lib/og/render';
import { ogImage, ogImageAlt, ogStaticParams } from '@/lib/og/route';

/** Width and height from the IHDR chunk of a PNG. */
function pngSize(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// Set OG_PREVIEW_DIR to also write every image to disk for a visual check.
const previewDir = process.env.OG_PREVIEW_DIR;

describe('Open Graph images', () => {
  for (const locale of LOCALES) {
    for (const page of OG_PAGES) {
      it(`renders a 1200×630 PNG for ${page} (${locale})`, async () => {
        const response = await ogImage(page)({ params: Promise.resolve({ locale }) });
        expect(response.headers.get('content-type')).toBe('image/png');
        const bytes = new Uint8Array(await response.arrayBuffer());
        expect([...bytes.slice(0, 8)]).toEqual(PNG_SIGNATURE);
        expect(pngSize(bytes)).toEqual(OG_SIZE);
        if (previewDir) {
          await mkdir(previewDir, { recursive: true });
          await writeFile(join(previewDir, `${page}-${locale}.png`), bytes);
        }
      }, 20_000);
    }
  }

  it('still renders 1200×630 with an overlong title and subtitle (clamped)', async () => {
    const response = await renderOgImage({
      kicker: 'Desarrollo web a medida',
      title:
        'Un título larguísimo que no debería existir nunca en el contenido porque no cabría de ninguna manera en una imagen social',
      subtitle: 'Una línea de apoyo muy larga '.repeat(12),
      landmark: 'taller',
      service: 'web',
      siteName: 'Pablo Jordá',
    });
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(pngSize(bytes)).toEqual(OG_SIZE);
    if (previewDir) await writeFile(join(previewDir, 'stress.png'), bytes);
  }, 20_000);

  it('prerenders both locales and shares one alt with both titles', () => {
    expect(ogStaticParams()).toEqual(LOCALES.map((locale) => ({ locale })));
    const alt = ogImageAlt('ai');
    expect(alt).toContain('Soluciones con IA');
    expect(alt).toContain('AI solutions');
    expect(alt).toContain('Tú me cuentas el problema. Yo lo resuelvo.');
    expect(ogImageAlt('case')).toBe('Pablo Jordá · Caso de estudio / Case study: Píxel y Papel');
  });
});
