/**
 * The thesis, drawn.
 *
 * A job title as a small closed box, and underneath it the body of work the box is hiding. This
 * is the hero illustration and it has one job: make someone understand the company before they
 * read a sentence.
 *
 * Hand-authored SVG rather than an image file — nothing to download, sharp at any size, and it
 * inherits the palette from CSS variables so it can never drift from the rest of the site.
 */
export function TitleVsWork({ className }: { className?: string }) {
  // Six pieces of work fanning out beneath the title.
  const cards = [
    { x: 24, label: "Automation", tall: 44 },
    { x: 126, label: "Research", tall: 62 },
    { x: 228, label: "AI Enablement", tall: 38, accent: true },
    { x: 330, label: "Data", tall: 54 },
    { x: 432, label: "Storytelling", tall: 46 },
    { x: 534, label: "Events", tall: 34 },
  ];

  return (
    <svg
      viewBox="0 0 620 460"
      className={className}
      role="img"
      aria-label="A single job title above the much larger body of work it hides"
    >
      <defs>
        <pattern id="tvw-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--ink)" opacity="0.055" />
        </pattern>
      </defs>

      <rect width="620" height="460" fill="var(--paper-dim)" />
      <rect width="620" height="460" fill="url(#tvw-dots)" />

      {/* --- The title: one small, closed box ------------------------------ */}
      <g>
        <rect
          x="208"
          y="34"
          width="204"
          height="52"
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeOpacity="0.25"
        />
        {/* The title, named: one string, and everything below it invisible. */}
        <text
          x="310"
          y="66"
          textAnchor="middle"
          fontSize="19"
          fontFamily="var(--font-serif), Georgia, serif"
          fill="var(--ink)"
          opacity="0.85"
        >
          Operations Manager
        </text>
        <text
          x="310"
          y="24"
          textAnchor="middle"
          fontSize="11"
          letterSpacing="1.6"
          fill="var(--ink-faint)"
        >
          YOUR JOB TITLE
        </text>
      </g>

      {/* --- The fan: what the box is actually sitting on ------------------ */}
      <g stroke="var(--ink)" strokeOpacity="0.16" fill="none">
        {cards.map((c) => (
          <path key={c.x} d={`M310 86 C310 140, ${c.x + 32} 150, ${c.x + 32} 214`} />
        ))}
      </g>

      {/* --- The work ------------------------------------------------------ */}
      {cards.map((c) => {
        const top = 214;
        const height = c.tall + 70;
        return (
          <g key={c.x}>
            <rect
              x={c.x}
              y={top}
              width="64"
              height={height}
              fill="var(--paper)"
              stroke={c.accent ? "var(--accent)" : "var(--ink)"}
              strokeOpacity={c.accent ? 0.55 : 0.18}
            />
            {/* A small abstract of the work itself. */}
            <g opacity="0.5">
              <rect x={c.x + 12} y={top + 14} width="40" height="3" fill="var(--ink)" opacity="0.4" />
              <rect x={c.x + 12} y={top + 22} width="26" height="3" fill="var(--ink)" opacity="0.28" />
              <rect
                x={c.x + 12}
                y={top + 34}
                width="40"
                height={c.tall}
                fill={c.accent ? "var(--accent)" : "var(--evidence)"}
                opacity={c.accent ? 0.16 : 0.1}
              />
            </g>
            {/* The evidence mark, a filled dot means it's backed by something real. */}
            <circle
              cx={c.x + 32}
              cy={top + height - 16}
              r="3.5"
              fill={c.accent ? "var(--accent)" : "var(--evidence)"}
            />
            {/* The card, named: the life the title was hiding. */}
            <text
              x={c.x + 32}
              y={top + height + 18}
              textAnchor="middle"
              fontSize="10.5"
              letterSpacing="0.6"
              fill={c.accent ? "var(--accent)" : "var(--ink-faint)"}
            >
              {c.label}
            </text>
          </g>
        );
      })}

      <text
        x="310"
        y="440"
        textAnchor="middle"
        fontSize="11"
        letterSpacing="1.6"
        fill="var(--ink-faint)"
      >
        WHAT YOU ACTUALLY DID
      </text>
    </svg>
  );
}
