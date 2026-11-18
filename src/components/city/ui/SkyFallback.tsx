/**
 * Static stand-in for the 3D city: the sky of the current hour (`--sky`, set
 * before first paint by the boot script) over a flat skyline of the same
 * landmarks. Shown before the canvas loads and whenever WebGL is unavailable.
 * Lit windows use `--skyline-light`, which equals the silhouette by day.
 */
export function SkyFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--sky)_0%,var(--sky)_55%,color-mix(in_oklab,var(--sky)_55%,var(--ground))_100%)] transition-[background] duration-700"
    >
      <svg
        viewBox="0 0 1200 300"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-[42%] w-full"
      >
        <g className="fill-skyline">
          <rect x="0" y="268" width="1200" height="32" />
          {/* old town roofs */}
          <path d="M40 268v-38h46v-16h40v54zM150 268v-30l22-14 22 14v30zM205 268v-44h52v44zM600 268v-36h44v-12h38v48zM700 268v-30h60v30z" />
          {/* Micalet and the cathedral */}
          <path d="M296 268V96h6v-8h30v8h6v172z" />
          <path d="M306 88V70h22v18zM312 70l5-12 5 12z" />
          <path d="M338 268v-62l58-22 58 22v62z" />
          <path d="M380 184v-18h32v18z" />
          {/* Mercado Central */}
          <path d="M466 268v-56h150v56z" />
          <path d="M500 212a32 32 0 0 1 64 0z" />
          <path d="M528 180v-14h8v14z" />
          <path d="M580 212a18 18 0 0 1 36 0z" />
          {/* Ciudad de las Artes y las Ciencias */}
          <path d="M770 268c20-30 120-30 140 0z" />
          <path d="M930 268v-44l12-20 10 20 10-26 10 26 10-20 10 20 10-26 10 26v44z" />
          <path d="M800 268c-10-60 40-96 80-104-30 26-50 60-48 104z" />
          {/* the port and El Faro */}
          <path d="M1040 268v-6h160v6z" />
          <path d="M1092 262v-104l4-6h12l4 6v104z" />
          <path d="M1094 152v-14h16v14zM1096 138l6-10 6 10z" />
        </g>
        <g className="fill-skyline-light">
          <rect x="314" y="74" width="6" height="10" />
          <rect x="1096" y="141" width="12" height="9" />
          <rect x="384" y="170" width="24" height="10" />
          <rect x="480" y="230" width="10" height="14" />
          <rect x="590" y="230" width="10" height="14" />
          <rect x="612" y="240" width="8" height="12" />
          <rect x="54" y="240" width="8" height="12" />
          <rect x="216" y="236" width="8" height="12" />
          <rect x="236" y="244" width="8" height="12" />
          <rect x="950" y="238" width="60" height="8" />
        </g>
      </svg>
    </div>
  );
}
