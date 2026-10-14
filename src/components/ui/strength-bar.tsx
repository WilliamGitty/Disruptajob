import { cn } from "@/lib/utils";

export function StrengthBar({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  return (
    <div className={cn("h-[3px] w-full bg-ink/8", className)}>
      <div
        className="h-full bg-ink transition-all duration-500 ease-out group-hover:bg-accent"
        style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
      />
    </div>
  );
}
