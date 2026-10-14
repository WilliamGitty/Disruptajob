/**
 * Drawings for the screens people reach when they have nothing yet.
 *
 * These matter more than the marketing pages. An empty inbox is where someone eleven months into
 * a job search feels worst, and a bare "no results" is quietly cruel in that moment. Something
 * drawn and calm reads as "this is a normal early state", which is both kinder and true.
 */

/** Nobody has been in touch yet. Deliberately calm rather than sad. */
export function QuietInbox({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 96"
      className={className}
      role="img"
      aria-label="An inbox waiting to be filled"
    >
      {/* A tray, open and ready rather than empty and failed. */}
      <path
        d="M34 56 H126 L116 82 H44 Z"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeOpacity="0.2"
      />
      <path d="M34 56 L44 34 H116 L126 56" fill="none" stroke="var(--ink)" strokeOpacity="0.14" />

      {/* Space above it, where the approaches will land. */}
      {[
        { x: 58, y: 20, w: 44, o: 0.12 },
        { x: 66, y: 10, w: 28, o: 0.07 },
      ].map((l) => (
        <rect key={l.y} x={l.x} y={l.y} width={l.w} height="6" fill="var(--ink)" opacity={l.o} />
      ))}

      <circle cx="80" cy="66" r="3" fill="var(--evidence)" opacity="0.5" />
    </svg>
  );
}

/** No work published yet — framed as a shelf with room on it, not a void. */
export function EmptyShelf({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 96"
      className={className}
      role="img"
      aria-label="A shelf with room for your work"
    >
      <path d="M28 74 H132" stroke="var(--ink)" strokeOpacity="0.25" />

      {/* One piece already there — the first project is all we ask for. */}
      <rect
        x="36"
        y="40"
        width="26"
        height="34"
        fill="var(--paper)"
        stroke="var(--accent)"
        strokeOpacity="0.55"
      />
      <rect x="42" y="48" width="14" height="3" fill="var(--ink)" opacity="0.3" />
      <rect x="42" y="55" width="10" height="3" fill="var(--ink)" opacity="0.2" />
      <rect x="42" y="63" width="14" height="6" fill="var(--accent)" opacity="0.18" />

      {/* Room for more, drawn as invitation rather than absence. */}
      {[72, 100].map((x) => (
        <rect
          key={x}
          x={x}
          y="46"
          width="26"
          height="28"
          fill="none"
          stroke="var(--ink)"
          strokeOpacity="0.16"
          strokeDasharray="4 4"
        />
      ))}
    </svg>
  );
}

/** Nothing matched a search — the pool, with the gaps visible. */
export function NoMatches({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 96" className={className} role="img" aria-label="No matching profiles">
      {Array.from({ length: 15 }, (_, i) => {
        const x = 24 + (i % 5) * 26;
        const y = 24 + Math.floor(i / 5) * 24;
        const faded = i % 3 !== 1;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="6"
            fill="none"
            stroke="var(--ink)"
            strokeOpacity={faded ? 0.12 : 0.3}
            strokeDasharray={faded ? "2 3" : undefined}
          />
        );
      })}
    </svg>
  );
}
