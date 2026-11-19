import { ImageResponse } from 'next/og';

import { MONOGRAM } from '@/components/brand/monogram-shape';
import type { PlaceId, ServiceId } from '@/content';
import { themes } from '@/lib/theme/tokens';

import { fitTitle, OG_SIZE, TITLE_MAX_LINES, TITLE_MAX_WIDTH } from './copy';
import { loadOgFonts } from './fonts';
import {
  LANDMARK_VIEWBOX,
  LANDMARKS,
  SKYLINE_ANCHOR_X,
  SKYLINE_BODY,
  SKYLINE_LIGHTS,
  SKYLINE_VIEWBOX,
} from './skyline';

/** Night palette of "La ciudad" plus the night sky of the clock. */
const night = themes.night;
const SKY_TOP = '#0a1024';
const SKY_MID = '#121836';
const SKY_HORIZON = '#2b2650';
const SKYLINE = '#1b2240';
const DOMAIN = 'pablojorda.es';

const PAD_X = 72;

/**
 * The skyline is drawn at 80% and centred, so the tallest landmarks stay
 * below the text block. Its viewBox is widened (and raised) to match.
 */
const SKYLINE_SCALE = 0.8;
const SKYLINE_BOX = {
  x: -(OG_SIZE.width / SKYLINE_SCALE - SKYLINE_VIEWBOX.width) / 2,
  y: SKYLINE_VIEWBOX.height - SKYLINE_VIEWBOX.height / SKYLINE_SCALE,
  width: OG_SIZE.width / SKYLINE_SCALE,
  height: SKYLINE_VIEWBOX.height / SKYLINE_SCALE,
};
/** Image x of a skyline x. */
const skylineX = (x: number) => (x - SKYLINE_BOX.x) * SKYLINE_SCALE;

export interface OgImageInput {
  kicker: string;
  title: string;
  subtitle: string;
  /** Landmark lit in the accent colour; `null` lights the whole city softly. */
  landmark: PlaceId | null;
  /** Service whose landmark is drawn next to the kicker. */
  service?: ServiceId;
  /** Brand name next to the monogram. */
  siteName: string;
}

function Monogram({ size }: { size: number }) {
  const k = size / MONOGRAM.size;
  return (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: size,
        height: size,
        borderRadius: MONOGRAM.radius * k,
        background: MONOGRAM.background,
        boxShadow: `0 0 0 1px ${night.line}`,
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
    </div>
  );
}

function Skyline({ landmark }: { landmark: PlaceId | null }) {
  const lights = Object.entries(SKYLINE_LIGHTS) as [PlaceId | 'other', typeof SKYLINE_LIGHTS.lab][];
  return (
    <svg
      width={OG_SIZE.width}
      height={SKYLINE_VIEWBOX.height}
      viewBox={`${SKYLINE_BOX.x} ${SKYLINE_BOX.y} ${SKYLINE_BOX.width} ${SKYLINE_BOX.height}`}
      style={{ position: 'absolute', left: 0, bottom: 0 }}
    >
      {SKYLINE_BODY.map((d) => (
        <path key={d} d={d} fill={SKYLINE} />
      ))}
      {lights.flatMap(([place, rects]) =>
        rects.map(([x, y, w, h]) => {
          const lit = landmark === null || place === landmark;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={w}
              height={h}
              fill={place === landmark ? night.accent : night.skylineLight}
              fillOpacity={lit ? 1 : 0.35}
            />
          );
        }),
      )}
    </svg>
  );
}

function LandmarkIcon({ service, height }: { service: ServiceId; height: number }) {
  const { body, lights } = LANDMARKS[service];
  const width = (LANDMARK_VIEWBOX.width / LANDMARK_VIEWBOX.height) * height;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${LANDMARK_VIEWBOX.width} ${LANDMARK_VIEWBOX.height}`}
    >
      <path d={body} fill={night.textMuted} />
      <path d={lights} fill={night.accent} />
    </svg>
  );
}

/** The social image element: pure layout, no I/O. */
export function OgImage({ kicker, title, subtitle, landmark, service, siteName }: OgImageInput) {
  const { fontSize, lines } = fitTitle(title);
  // Title and subtitle share four lines: a short title leaves room for more.
  const subtitleLines = Math.max(1, 4 - lines);
  const glowX = landmark ? skylineX(SKYLINE_ANCHOR_X[landmark]) : OG_SIZE.width / 2;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        backgroundColor: night.ground,
        backgroundImage: `linear-gradient(180deg, ${SKY_TOP} 0%, ${SKY_MID} 55%, ${SKY_HORIZON} 100%)`,
        color: night.text,
        fontFamily: 'Inter Tight',
      }}
    >
      {/* warm glow behind the landmark of the page */}
      <div
        style={{
          position: 'absolute',
          left: glowX - 380,
          bottom: -380,
          width: 760,
          height: 760,
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 176, 103, ${landmark ? 0.3 : 0.18}) 0%, rgba(255, 176, 103, 0.08) 40%, rgba(255, 176, 103, 0) 70%)`,
        }}
      />
      <Skyline landmark={landmark} />

      {/* header: monogram + name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `56px ${PAD_X}px 0`,
          gap: 18,
        }}
      >
        <Monogram size={52} />
        <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.2 }}>{siteName}</div>
      </div>

      {/* copy */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: `44px ${PAD_X}px 0`,
          maxWidth: TITLE_MAX_WIDTH + PAD_X * 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {service ? <LandmarkIcon service={service} height={32} /> : null}
          <div
            style={{
              fontFamily: 'JetBrains Mono',
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: night.accent,
            }}
          >
            {kicker}
          </div>
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: 'Syne',
            fontWeight: 700,
            fontSize,
            lineHeight: 1.04,
            letterSpacing: -fontSize * 0.02,
            maxWidth: TITLE_MAX_WIDTH,
            lineClamp: TITLE_MAX_LINES,
            display: 'block',
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 26,
            lineHeight: 1.38,
            color: night.textMuted,
            maxWidth: TITLE_MAX_WIDTH,
            lineClamp: subtitleLines,
            display: 'block',
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* domain, on the quay */}
      <div
        style={{
          position: 'absolute',
          left: PAD_X,
          bottom: 6,
          display: 'flex',
          fontFamily: 'JetBrains Mono',
          fontWeight: 500,
          fontSize: 18,
          letterSpacing: 1.5,
          color: night.textMuted,
        }}
      >
        {DOMAIN}
      </div>
    </div>
  );
}

/** Renders the social image of a page as a 1200×630 PNG. */
export async function renderOgImage(input: OgImageInput): Promise<ImageResponse> {
  const fonts = await loadOgFonts();
  return new ImageResponse(<OgImage {...input} />, { ...OG_SIZE, fonts });
}
