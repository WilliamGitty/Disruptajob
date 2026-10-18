import { seededRandom } from "@/lib/seed";
import { cn } from "@/lib/utils";

/**
 * The whole person, at a glance: every demonstrated capability radiating from the centre,
 * spoke length driven by how much published evidence stands behind it. A tester (wearing her
 * employer hat) asked for exactly this: the per-project bursts are good, "but as an employer,
 * I wanna see one before looking at the breakdown".
 *
 * This is the one rule made visible. Lengths come from evidence counts computed at read time
 * from published tagged work; there is nothing here a person could type to make a spoke longer.
 */

interface SpokeInput {
  tag: string;
  label: string;
  evidenceCount: number;
}

const WIDTH = 420;
const HEIGHT = 300;
const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const MAX_SPOKES = 6;

export function CapabilityConstellation({
  capabilities,
  seed,
  className,
}: {
  capabilities: SpokeInput[];
  seed: string;
  className?: string;
}) {
  const withEvidence = capabilities
    .filter((c) => c.evidenceCount > 0)
    .sort((a, b) => b.evidenceCount - a.evidenceCount);
  if (withEvidence.length < 2) return null;

  const shown = withEvidence.slice(0, MAX_SPOKES);
  const extra = withEvidence.length - shown.length;
  const maxCount = shown[0].evidenceCount;
  const rng = seededRandom(`constellation-${seed}`);
  const baseAngle = rng() * Math.PI * 2;
  const n = shown.length;

  const spokes = shown.map((c, i) => {
    // Interleave strong and weak spokes around the circle so the shape reads as a person,
    // not a pie chart with a bite out of it.
    const slot = (i % 2 === 0 ? i / 2 : n - (i + 1) / 2) | 0;
    const angle = baseAngle + (slot / n) * Math.PI * 2;
    const r = 52 + 58 * (c.evidenceCount / maxCount);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = CX + cos * r;
    const y = CY + sin * r * 0.58;
    // Labels continue outward along the spoke, so they can never collide over the centre.
    let lx = CX + cos * (r + 16);
    const ly = CY + sin * (r + 30) * 0.58;
    const anchor: "start" | "end" | "middle" =
      cos > 0.35 ? "start" : cos < -0.35 ? "end" : "middle";
    // Slide the label along its own baseline so the whole text stays inside the frame;
    // ~6.4px per character at this font size, measured rather than hoped.
    const approx = c.label.length * 6.4;
    if (anchor === "start") lx = Math.min(lx, WIDTH - 12 - approx);
    if (anchor === "end") lx = Math.max(lx, 12 + approx);
    if (anchor === "middle") lx = Math.min(Math.max(lx, 12 + approx / 2), WIDTH - 12 - approx / 2);
    return { ...c, x, y, lx, ly, anchor, below: sin > 0, strongest: i === 0 };
  });

  return (
    <figure className={cn("bg-paper-dim", className)}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full"
        role="img"
        aria-label={`Demonstrated capabilities: ${shown
          .map((s) => `${s.label} (${s.evidenceCount})`)
          .join(", ")}`}
      >
        <defs>
          <pattern id={`cgrid-${seed}`} width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" className="fill-ink/8" />
          </pattern>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill={`url(#cgrid-${seed})`} />

        {spokes.map((s) => (
          <line
            key={`l-${s.tag}`}
            x1={CX}
            y1={CY}
            x2={s.x}
            y2={s.y}
            className={s.strongest ? "stroke-accent/70" : "stroke-ink/25"}
            strokeWidth={s.strongest ? 2 : 1.5}
          />
        ))}

        {spokes.map((s) => (
          <g key={`n-${s.tag}`}>
            <circle
              cx={s.x}
              cy={s.y}
              r={4 + Math.min(3, s.evidenceCount)}
              className={s.strongest ? "fill-accent" : "fill-paper stroke-ink/40"}
              strokeWidth={1.5}
            />
            <text
              x={s.lx}
              y={s.below ? s.ly + 10 : s.ly - 12}
              textAnchor={s.anchor}
              className="fill-ink/70"
              style={{ fontSize: 12, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
            >
              {s.label}
            </text>
            <text
              x={s.lx}
              y={s.below ? s.ly + 23 : s.ly + 1}
              textAnchor={s.anchor}
              className="fill-ink/40"
              style={{ fontSize: 10, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
            >
              {s.evidenceCount} {s.evidenceCount === 1 ? "piece" : "pieces"}
            </text>
          </g>
        ))}

        {/* the person, at the centre */}
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
            +{extra} more below
          </text>
        )}
      </svg>
      <figcaption className="border-t border-ink/10 px-4 py-2.5 text-[11px] leading-snug text-ink-faint">
        Spoke length is published evidence, counted, never declared.
      </figcaption>
    </figure>
  );
}
