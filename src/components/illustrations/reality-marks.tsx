/**
 * Three small drawings for the "it probably isn't you" section.
 *
 * Each one states its card's argument without words. They're deliberately quiet — this section is
 * about someone feeling recognised, and a loud graphic would undercut that.
 */

const BOX = "0 0 120 80";

/** Applications going out, almost nothing coming back. */
export function SentIntoSilence({ className }: { className?: string }) {
  // Twelve sent, one answered — roughly the real ratio, which is the point.
  const sent = Array.from({ length: 12 }, (_, i) => ({
    x: 8 + (i % 6) * 10,
    y: 16 + Math.floor(i / 6) * 11,
  }));

  return (
    <svg viewBox={BOX} className={className} role="img" aria-label="Many applications sent, one reply">
      {sent.map((s, i) => (
        <rect
          key={i}
          x={s.x}
          y={s.y}
          width="7"
          height="9"
          fill="var(--ink)"
          opacity={0.16}
          stroke="var(--ink)"
          strokeOpacity="0.1"
        />
      ))}
      {/* The one that came back. */}
      <rect
        x="98"
        y="38"
        width="9"
        height="11"
        fill="var(--accent)"
        opacity="0.75"
      />
      <path
        d="M72 43 H92"
        stroke="var(--ink)"
        strokeOpacity="0.3"
        strokeDasharray="3 3"
      />
      <text x="8" y="70" fontSize="8" letterSpacing="0.8" fill="var(--ink-faint)">
        SENT
      </text>
      <text x="92" y="70" fontSize="8" letterSpacing="0.8" fill="var(--ink-faint)">
        REPLY
      </text>
    </svg>
  );
}

/** A container too small for what's inside it. */
export function TitleTooSmall({ className }: { className?: string }) {
  return (
    <svg viewBox={BOX} className={className} role="img" aria-label="A job title too small to contain the work">
      {/* The role, overflowing. */}
      <rect x="10" y="14" width="30" height="30" fill="var(--evidence)" opacity="0.18" />
      <rect x="44" y="14" width="30" height="30" fill="var(--evidence)" opacity="0.14" />
      <rect x="78" y="14" width="30" height="30" fill="var(--evidence)" opacity="0.1" />
      {/* The title — one box, covering a third of it. */}
      <rect
        x="10"
        y="52"
        width="30"
        height="14"
        fill="var(--paper)"
        stroke="var(--accent)"
        strokeOpacity="0.6"
      />
      <rect x="15" y="58" width="20" height="3" fill="var(--ink)" opacity="0.3" />
      <path d="M44 59 H108" stroke="var(--ink)" strokeOpacity="0.16" strokeDasharray="2 3" />
      <text x="48" y="70" fontSize="8" letterSpacing="0.8" fill="var(--ink-faint)">
        NOT ON THE CV
      </text>
    </svg>
  );
}

/** Everyone's application now looks identical. */
export function IdenticalOnPaper({ className }: { className?: string }) {
  return (
    <svg viewBox={BOX} className={className} role="img" aria-label="Identical polished applications">
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${6 + i * 22} 14)`}>
          <rect
            width="17"
            height="42"
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeOpacity="0.18"
          />
          {/* Exactly the same lines on every one. */}
          {[6, 12, 18, 24, 30].map((y) => (
            <rect key={y} x="3" y={y} width="11" height="2.5" fill="var(--ink)" opacity="0.2" />
          ))}
        </g>
      ))}
      <text x="6" y="70" fontSize="8" letterSpacing="0.8" fill="var(--ink-faint)">
        ALL EQUALLY IMPRESSIVE
      </text>
    </svg>
  );
}
