import { MONOGRAM } from './monogram-shape';

interface MonogramProps {
  className?: string;
  /** Accessible name; omit when the monogram sits next to the written name. */
  title?: string;
}

/** The "PJ" monogram as inline SVG. */
export function Monogram({ className, title }: MonogramProps) {
  const { size, radius, background, rects } = MONOGRAM;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <rect width={size} height={size} rx={radius} fill={background} />
      {rects.map((r) => (
        <rect
          key={`${r.x}-${r.y}`}
          x={r.x}
          y={r.y}
          width={r.w}
          height={r.h}
          fill={MONOGRAM[r.tone]}
        />
      ))}
    </svg>
  );
}
