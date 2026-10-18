import { seededRandom } from "@/lib/seed";
import { capabilityLabel } from "@/lib/capabilities";
import { cn } from "@/lib/utils";

/**
 * Project card art that says something: the project's own capability tags radiating from a
 * centre. Replaces the abstract node-graph, which the founder judged correctly — it conveyed
 * nothing. This one is read at a glance: the middle is the work, the spokes are what it proves.
 *
 * Deterministic per seed (rotation and spoke lengths), so cards stay stable between renders and
 * a wall of projects doesn't look stamped from one die.
 */

const WIDTH = 400;
const HEIGHT = 280;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const MAX_SPOKES = 5;

export function CapabilityBurst({
  tags,
  seed,
  className,
}: {
  tags: string[];
  seed: string;
  className?: string;
}) {
  const rng = seededRandom(seed);
  const shown = tags.slice(0, MAX_SPOKES);
  const extra = tags.length - shown.length;
  const n = Math.max(shown.length, 1);
  const baseAngle = rng() * Math.PI * 2;

  const spokes = shown.map((tag, i) => {
    const angle = baseAngle + (i / n) * Math.PI * 2;
    const r = 78 + rng() * 26;
    const x = CX + Math.cos(angle) * r;
    // Flatten vertically so labels stay inside the 16:10 frame.
    const y = CY + Math.sin(angle) * r * 0.62;
    const labelAbove = y < CY;
    return { tag, x, y, labelAbove, accent: i === 0 };
  });

  return (
    <div className={cn("bg-paper-dim", className)} aria-hidden>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full">
        {/* the quiet dot grid, kept from the old art, it reads as graph paper, not decoration */}
        <defs>
          <pattern id={`grid-${seed}`} width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" className="fill-ink/8" />
          </pattern>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill={`url(#grid-${seed})`} />

        {spokes.map((s) => (
          <line
            key={`l-${s.tag}`}
            x1={CX}
            y1={CY}
            x2={s.x}
            y2={s.y}
            className={s.accent ? "stroke-accent/70" : "stroke-ink/25"}
            strokeWidth={s.accent ? 2 : 1.5}
          />
        ))}

        {spokes.map((s) => (
          <g key={`n-${s.tag}`}>
            <circle
              cx={s.x}
              cy={s.y}
              r={5}
              className={s.accent ? "fill-accent" : "fill-paper stroke-ink/40"}
              strokeWidth={1.5}
            />
            <text
              x={s.x}
              y={s.labelAbove ? s.y - 12 : s.y + 20}
              textAnchor="middle"
              className="fill-ink/60"
              style={{ fontSize: 12, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
            >
              {capabilityLabel(s.tag)}
            </text>
          </g>
        ))}

        {/* the work itself, at the centre */}
        <circle cx={CX} cy={CY} r={10} className="fill-ink" />
        <circle cx={CX} cy={CY} r={16} className="fill-none stroke-ink/20" strokeWidth={1.5} />

        {extra > 0 && (
          <text
            x={WIDTH - 14}
            y={HEIGHT - 12}
            textAnchor="end"
            className="fill-ink/40"
            style={{ fontSize: 11, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
          >
            +{extra} more
          </text>
        )}
      </svg>
    </div>
  );
}
