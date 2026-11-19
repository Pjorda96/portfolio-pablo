import { ImageResponse } from 'next/og';

import { MONOGRAM } from '@/components/brand/monogram-shape';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Home-screen icon: the monogram full-bleed (iOS applies its own mask). */
export default function AppleIcon() {
  const k = size.width / MONOGRAM.size;
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        background: MONOGRAM.background,
      }}
    >
      {MONOGRAM.rects.map((r) => (
        <div
          key={`${r.x}-${r.y}`}
          style={{
            position: 'absolute',
            left: r.x * k,
            top: r.y * k,
            width: r.w * k,
            height: r.h * k,
            background: MONOGRAM[r.tone],
          }}
        />
      ))}
    </div>,
    size,
  );
}
