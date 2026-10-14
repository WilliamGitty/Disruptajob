import { seededRandom } from "@/lib/seed";
import { cn } from "@/lib/utils";

interface Node {
  x: number;
  y: number;
}

const WIDTH = 400;
const HEIGHT = 280;

function buildNodes(seed: string) {
  const rng = seededRandom(seed);
  const count = 6 + Math.floor(rng() * 4); // 6-9
  const nodes: Node[] = [];
  const margin = 36;
  for (let i = 0; i < count; i++) {
    nodes.push({
      x: margin + rng() * (WIDTH - margin * 2),
      y: margin + rng() * (HEIGHT - margin * 2),
    });
  }

  // Connect each node to its nearest earlier node, producing a tree-like diagram
  // reminiscent of a capability graph rather than random noise.
  const edges: [number, number][] = [];
  for (let i = 1; i < nodes.length; i++) {
    let nearest = 0;
    let best = Infinity;
    for (let j = 0; j < i; j++) {
      const d = (nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2;
      if (d < best) {
        best = d;
        nearest = j;
      }
    }
    edges.push([i, nearest]);
  }

  const heroIndex = Math.floor(rng() * nodes.length);
  return { nodes, edges, heroIndex };
}

export function ProjectThumbnail({
  seed,
  className,
  variant = "card",
}: {
  seed: string;
  className?: string;
  variant?: "card" | "hero";
}) {
  const { nodes, edges, heroIndex } = buildNodes(seed);

  return (
    <div className={cn("relative overflow-hidden bg-paper-dim grain-noise", className)}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="transparent" />
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="var(--ink)"
            strokeOpacity={0.22}
            strokeWidth={1}
          />
        ))}
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={i === heroIndex ? (variant === "hero" ? 9 : 7) : 3.5}
            fill={i === heroIndex ? "var(--accent)" : "var(--paper)"}
            stroke={i === heroIndex ? "var(--accent)" : "var(--ink)"}
            strokeOpacity={i === heroIndex ? 1 : 0.4}
            strokeWidth={1.25}
          />
        ))}
      </svg>
    </div>
  );
}
