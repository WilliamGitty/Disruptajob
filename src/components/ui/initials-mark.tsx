import { cn } from "@/lib/utils";

const PALETTE = [
  "#b3401c",
  "#2f5a46",
  "#3c4a6b",
  "#8a5a2b",
  "#5c4a6e",
  "#2f6b6a",
  "#6b4a2f",
  "#4a5a2f",
];

export function InitialsMark({
  initials,
  index = 0,
  size = "md",
  className,
}: {
  initials: string;
  index?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const color = PALETTE[index % PALETTE.length];
  const dims = size === "sm" ? "h-9 w-9 text-xs" : size === "lg" ? "h-16 w-16 text-xl" : "h-12 w-12 text-sm";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border font-serif-display font-medium",
        dims,
        className
      )}
      style={{ borderColor: `${color}55`, color, backgroundColor: `${color}14` }}
    >
      {initials}
    </div>
  );
}
