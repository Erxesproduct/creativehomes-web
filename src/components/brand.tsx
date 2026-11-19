/** The logo's pieces: torn white paper, the brushed-gold plate, the stripe disc. Decorative parts are aria-hidden. */

/** A deterministic ragged edge (same on server and client): small steps along each side of the box. */
function tornPath(seed: number) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const pts: string[] = [];
  const step = 3.2;
  for (let x = 0; x <= 100; x += step) pts.push(`${x.toFixed(1)}% ${(rnd() * 7).toFixed(1)}%`);
  for (let y = 0; y <= 100; y += step * 3) pts.push(`${(100 - rnd() * 1.6).toFixed(1)}% ${y.toFixed(1)}%`);
  for (let x = 100; x >= 0; x -= step) pts.push(`${x.toFixed(1)}% ${(100 - rnd() * 7).toFixed(1)}%`);
  for (let y = 100; y >= 0; y -= step * 3) pts.push(`${(rnd() * 1.6).toFixed(1)}% ${y.toFixed(1)}%`);
  return `polygon(${pts.join(",")})`;
}

/** White paper with torn edges, like the label on the logo. */
export function Torn({ children, className = "", seed = 7, as: Tag = "div" }: { children: React.ReactNode; className?: string; seed?: number; as?: "div" | "span" | "p" }) {
  return (
    <Tag className={`torn ${className}`} style={{ clipPath: tornPath(seed) }}>
      {children}
    </Tag>
  );
}

/** The brushed-gold plate with a torn label: section titles and the hero mark. */
export function Plate({ children, className = "", seed = 3 }: { children: React.ReactNode; className?: string; seed?: number }) {
  return (
    <div className={`gold relative inline-block p-3 md:p-4 ${className}`}>
      <span className="absolute top-1.5 left-1/2 h-1 w-6 -translate-x-1/2 bg-ink md:top-2" aria-hidden />
      <Torn seed={seed} className="px-5 py-3 text-center md:px-8 md:py-4">
        {children}
      </Torn>
      <span className="absolute bottom-1.5 left-1/2 h-1 w-6 -translate-x-1/2 bg-ink md:bottom-2" aria-hidden />
    </div>
  );
}

/** The round logo mark: stripes, gold square, paper label (drawn, so it stays sharp at any size). */
export function Mark({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
      <defs>
        <pattern id="mk-s" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="9" height="9" fill="#fff" />
          <rect width="4.5" height="9" fill="#191715" />
        </pattern>
        <linearGradient id="mk-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9a7740" />
          <stop offset=".5" stopColor="#efd9a2" />
          <stop offset="1" stopColor="#a8844a" />
        </linearGradient>
        <clipPath id="mk-c">
          <circle cx="50" cy="50" r="49" />
        </clipPath>
      </defs>
      <g clipPath="url(#mk-c)">
        <rect width="100" height="100" fill="url(#mk-s)" />
        <rect x="22" y="22" width="56" height="56" fill="url(#mk-g)" />
        <path d="M27 40l4-1 5 1 6-1 5 1 6-1 5 1 6-1 5 1 4 1v19l-4 1-5-1-6 1-5-1-6 1-5-1-6 1-5-1-4-1z" fill="#fffdf9" />
        <rect x="46" y="29" width="8" height="2.6" fill="#191715" />
        <rect x="46" y="68" width="8" height="2.6" fill="#191715" />
      </g>
      <circle cx="50" cy="50" r="49" fill="none" stroke="#191715" strokeWidth="1.5" />
    </svg>
  );
}

/** The word mark beside the round mark (the logo's condensed capitals). */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="font-[family-name:var(--font-label)] text-[19px] font-bold tracking-[0.16em] md:text-[22px]">CREATIVE HOMES</span>
      <span className="mt-1 font-[family-name:var(--font-label)] text-[10.5px] tracking-[0.5em] text-ink-3 md:text-[11.5px]">MONGOLIA · 2017</span>
    </span>
  );
}
