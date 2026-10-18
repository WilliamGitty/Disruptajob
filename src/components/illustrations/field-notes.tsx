/**
 * Second wave of the house illustration system, drawn after a tester called the site "too
 * basic and slick, like AI made it". The cure is not generated imagery (the most recognisable
 * machine-tell there is) but more of what no template has: hand-authored drawings that each
 * carry one argument, in the paper-and-ink palette, slightly imperfect on purpose.
 *
 * Same rules as title-vs-work.tsx: CSS variables only, so the drawings can never drift from
 * the site; viewBox SVG, so they are sharp at any size and cost no download.
 */

/** About: everything you did, squeezed through the nib of a CV into one thin line. */
export function CompressionDrawing({ className }: { className?: string }) {
  const work = [
    { x: 36, y: 26, w: 92, h: 40, label: "Research" },
    { x: 148, y: 14, w: 74, h: 52, label: "Systems" },
    { x: 242, y: 30, w: 100, h: 36, label: "Workshops", accent: true },
    { x: 362, y: 12, w: 66, h: 54, label: "Events" },
    { x: 448, y: 28, w: 88, h: 38, label: "The fixes" },
  ];
  return (
    <svg viewBox="0 0 560 300" className={className} role="img"
      aria-label="Many pieces of real work funnelled down into a single thin line on a CV">
      <defs>
        <pattern id="fn-dots-a" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--ink)" opacity="0.055" />
        </pattern>
      </defs>
      <rect width="560" height="300" fill="var(--paper-dim)" />
      <rect width="560" height="300" fill="url(#fn-dots-a)" />

      {work.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="var(--paper)"
            stroke={b.accent ? "var(--accent)" : "var(--ink)"}
            strokeOpacity={b.accent ? 0.75 : 0.25} />
          <rect x={b.x + 10} y={b.y + 12} width={b.w - 24} height={5} fill="var(--ink)" opacity="0.22" />
          <rect x={b.x + 10} y={b.y + 23} width={(b.w - 24) * 0.6} height={5} fill="var(--ink)" opacity="0.14" />
          <text x={b.x + b.w / 2} y={b.y + b.h + 14} textAnchor="middle" fontSize="10"
            letterSpacing="1.2" fill="var(--ink-faint)">{b.label.toUpperCase()}</text>
        </g>
      ))}

      {/* The funnel: everything converges on a nib. */}
      {work.map((b) => (
        <path key={`p-${b.label}`}
          d={`M ${b.x + b.w / 2} ${b.y + b.h + 20} C ${b.x + b.w / 2} 200, 280 190, 280 218`}
          fill="none" stroke="var(--ink)" strokeOpacity="0.18" strokeWidth="1.2" />
      ))}
      <path d="M 272 218 L 288 218 L 281 236 Z" fill="none" stroke="var(--ink)" strokeOpacity="0.4" strokeWidth="1.3" />

      {/* What survives: one grey bar. */}
      <rect x="190" y="252" width="180" height="8" fill="var(--ink)" opacity="0.3" />
      <text x="280" y="280" textAnchor="middle" fontSize="10" letterSpacing="1.6" fill="var(--ink-faint)">
        ONE LINE ON A CV
      </text>
    </svg>
  );
}

/** Calm: a vast quiet, and one message that was worth sending. */
export function OneQuietMessage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 240" className={className} role="img"
      aria-label="A single envelope in a large quiet space: one message, nothing else">
      <defs>
        <pattern id="fn-dots-b" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--ink)" opacity="0.05" />
        </pattern>
      </defs>
      <rect width="560" height="240" fill="var(--paper-dim)" />
      <rect width="560" height="240" fill="url(#fn-dots-b)" />

      {/* Ghosts of the notifications this product refuses to send. */}
      {[52, 92, 132].map((y, i) => (
        <g key={y} opacity={0.1 - i * 0.02}>
          <rect x="36" y={y} width="120" height="22" fill="none" stroke="var(--ink)" strokeWidth="1" />
          <line x1="36" y1={y + 22} x2="156" y2={y} stroke="var(--ink)" strokeWidth="1" />
        </g>
      ))}

      {/* The one that matters. */}
      <g>
        <rect x="352" y="88" width="120" height="74" fill="var(--paper)" stroke="var(--ink)" strokeOpacity="0.45" strokeWidth="1.4" />
        <path d="M 352 92 L 412 130 L 472 92" fill="none" stroke="var(--ink)" strokeOpacity="0.45" strokeWidth="1.4" />
        <circle cx="472" cy="88" r="7" fill="var(--accent)" />
      </g>
      <text x="412" y="188" textAnchor="middle" fontSize="10" letterSpacing="1.6" fill="var(--ink-faint)">
        ONE MESSAGE, WHEN IT MATTERS
      </text>
    </svg>
  );
}

/** Articles: a printed page that someone argued with in the margins. */
export function MarginNotes({ className }: { className?: string }) {
  const lines = [36, 52, 68, 84, 112, 128, 144, 172, 188];
  return (
    <svg viewBox="0 0 560 240" className={className} role="img"
      aria-label="A page of text with underlines and margin marks: opinions, held in public">
      <defs>
        <pattern id="fn-dots-c" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--ink)" opacity="0.055" />
        </pattern>
      </defs>
      <rect width="560" height="240" fill="var(--paper-dim)" />
      <rect width="560" height="240" fill="url(#fn-dots-c)" />

      <rect x="150" y="16" width="260" height="208" fill="var(--paper)" stroke="var(--ink)" strokeOpacity="0.22" />
      {lines.map((y, i) => (
        <rect key={y} x="170" y={y} width={i % 4 === 3 ? 150 : 220} height="6" fill="var(--ink)" opacity="0.16" />
      ))}

      {/* The argument: an accent underline, a strike, a margin stroke and an asterisk. */}
      <path d="M 170 94 C 230 98, 300 92, 390 96" fill="none" stroke="var(--accent)" strokeWidth="2" strokeOpacity="0.8" />
      <line x1="170" y1="131" x2="320" y2="131" stroke="var(--ink)" strokeOpacity="0.5" strokeWidth="1.6" />
      <path d="M 428 60 C 434 80, 434 110, 428 132" fill="none" stroke="var(--accent)" strokeWidth="2" strokeOpacity="0.7" />
      <text x="444" y="104" fontSize="22" fill="var(--accent)" opacity="0.85">*</text>
      <path d="M 120 176 C 136 170, 148 172, 162 176" fill="none" stroke="var(--ink)" strokeOpacity="0.35" strokeWidth="1.3" />
    </svg>
  );
}

/** Claims: four hundred identical pages against one body of work you can open. */
export function StackVsOne({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 260" className={className} role="img"
      aria-label="A tall stack of identical CVs beside one open, inspectable body of work">
      <defs>
        <pattern id="fn-dots-d" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--ink)" opacity="0.055" />
        </pattern>
      </defs>
      <rect width="560" height="260" fill="var(--paper-dim)" />
      <rect width="560" height="260" fill="url(#fn-dots-d)" />

      {/* The stack: the same page, over and over, slightly askew. */}
      {Array.from({ length: 9 }).map((_, i) => (
        <g key={i} transform={`translate(${70 + (i % 3) * 2.5} ${196 - i * 19}) rotate(${(i % 2 === 0 ? -1 : 1) * 0.8})`}>
          <rect width="130" height="34" fill="var(--paper)" stroke="var(--ink)" strokeOpacity="0.22" />
          <rect x="12" y="10" width="106" height="4" fill="var(--ink)" opacity="0.18" />
          <rect x="12" y="20" width="70" height="4" fill="var(--ink)" opacity="0.12" />
        </g>
      ))}
      <text x="138" y="246" textAnchor="middle" fontSize="10" letterSpacing="1.4" fill="var(--ink-faint)">
        400 THAT SOUND THE SAME
      </text>

      {/* The one you can open. */}
      <g>
        <rect x="330" y="44" width="180" height="152" fill="var(--paper)" stroke="var(--ink)" strokeOpacity="0.35" strokeWidth="1.3" />
        <rect x="346" y="60" width="80" height="44" fill="none" stroke="var(--accent)" strokeOpacity="0.8" strokeWidth="1.5" />
        <rect x="354" y="72" width="64" height="4" fill="var(--ink)" opacity="0.2" />
        <rect x="354" y="82" width="44" height="4" fill="var(--ink)" opacity="0.14" />
        <rect x="438" y="60" width="56" height="28" fill="none" stroke="var(--ink)" strokeOpacity="0.3" />
        <rect x="346" y="116" width="56" height="34" fill="none" stroke="var(--ink)" strokeOpacity="0.3" />
        <rect x="414" y="116" width="80" height="62" fill="none" stroke="var(--ink)" strokeOpacity="0.3" />
        <circle cx="426" cy="128" r="4" fill="var(--evidence, var(--accent))" opacity="0.8" />
      </g>
      <text x="420" y="222" textAnchor="middle" fontSize="10" letterSpacing="1.4" fill="var(--ink-faint)">
        ONE YOU CAN ACTUALLY INSPECT
      </text>
    </svg>
  );
}
