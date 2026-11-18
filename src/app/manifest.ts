import type { MetadataRoute } from 'next';

import { MONOGRAM } from '@/components/brand/monogram-shape';
import { themes } from '@/lib/theme/tokens';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pablo Jordá — Desarrollo web, IA y producto',
    short_name: 'Pablo Jordá',
    description:
      'Desarrollo web a medida, integraciones de inteligencia artificial y producto digital.',
    lang: 'es',
    start_url: '/',
    display: 'browser',
    background_color: themes.day.ground,
    theme_color: MONOGRAM.background,
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
