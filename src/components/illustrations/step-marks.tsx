/**
 * The three steps, drawn.
 *
 * Someone worn down by multi-hour applications needs to see how small the first ask is. These
 * show the shape of each step rather than illustrating it metaphorically — the second one is
 * literally what tagging looks like, so the drawing doubles as an explanation.
 */

const BOX = "0 0 140 70";

/** Step one: describe one thing you built. */
export function DescribeOneThing({ className }: { className?: string }) {
  return (
    <svg viewBox={BOX} className={className} role="img" aria-label="Writing up one project">
      <rect
        x="12"
        y="8"
        width="70"
        height="54"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeOpacity="0.22"
      />
      {/* Plain words — short lines, not a formal document. */}
      {[
        { y: 18, w: 48 },
        { y: 26, w: 54 },
        { y: 34, w: 40 },
      ].map((l) => (
        <rect key={l.y} x="22" y={l.y} width={l.w} height="3" fill="var(--ink)" opacity="0.26" />
      ))}
      {/* The artefact itself. */}
      <rect x="22" y="44" width="50" height="10" fill="var(--evidence)" opacity="0.16" />

      <path d="M92 35 H120" stroke="var(--ink)" strokeOpacity="0.25" />
      <path d="M114 30 L120 35 L114 40" fill="none" stroke="var(--ink)" strokeOpacity="0.25" />
    </svg>
  );
}

/** Step two: tag what it proves. This is the only thing that moves a score. */
export function TagWhatItProves({ className }: { className?: string }) {
  const tags = [
    { y: 10, w: 56, on: true },
    { y: 28, w: 44, on: true },
    { y: 46, w: 50, on: false },
  ];
  return (
    <svg viewBox={BOX} className={className} role="img" aria-label="Tagging capabilities a project demonstrates">
      {tags.map((t) => (
        <g key={t.y}>
          <rect
            x="34"
            y={t.y}
            width={t.w}
            height="14"
            fill={t.on ? "var(--accent-soft)" : "var(--paper)"}
            stroke={t.on ? "var(--accent)" : "var(--ink)"}
            strokeOpacity={t.on ? 0.5 : 0.18}
          />
          <rect
            x="40"
            y={t.y + 5}
            width={t.w - 18}
            height="3"
            fill="var(--ink)"
            opacity={t.on ? 0.35 : 0.18}
          />
          {/* A filled square marks the ones you've chosen. */}
          <rect
            x="18"
            y={t.y + 3}
            width="8"
            height="8"
            fill={t.on ? "var(--accent)" : "none"}
            stroke="var(--ink)"
            strokeOpacity={t.on ? 0 : 0.25}
          />
        </g>
      ))}
    </svg>
  );
}

/** Step three: you decide who can see it. */
export function YouDecideWhoSees({ className }: { className?: string }) {
  return (
    <svg viewBox={BOX} className={className} role="img" aria-label="Choosing who can see your profile">
      {/* Your profile, held. */}
      <rect
        x="16"
        y="18"
        width="38"
        height="34"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeOpacity="0.25"
      />
      <circle cx="35" cy="30" r="5" fill="var(--ink)" opacity="0.2" />
      <rect x="24" y="40" width="22" height="3" fill="var(--ink)" opacity="0.2" />

      {/* One company allowed through, one turned away. */}
      <path d="M62 28 H86" stroke="var(--evidence)" strokeOpacity="0.6" />
      <circle cx="94" cy="28" r="7" fill="var(--evidence)" opacity="0.18" />

      <path d="M62 46 H78" stroke="var(--ink)" strokeOpacity="0.2" strokeDasharray="3 3" />
      <circle cx="94" cy="46" r="7" fill="none" stroke="var(--ink)" strokeOpacity="0.18" />
      {/* The barrier that makes the choice real. */}
      <path d="M84 39 V53" stroke="var(--accent)" strokeOpacity="0.7" strokeWidth="1.5" />
    </svg>
  );
}
