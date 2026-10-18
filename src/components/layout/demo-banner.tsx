import { DEMO_MODE } from "@/server/config";

/**
 * Says plainly that this is a demonstration.
 *
 * Anyone landing here sees profiles with employment history and salary expectations. Without this
 * they'd reasonably assume those are real people — so the banner is as much about not misleading
 * visitors as it is about stopping someone typing their own details into a prototype.
 */
export function DemoBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div className="border-b border-ink/10 bg-ink text-paper">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 py-2 text-center text-xs lg:px-10">
        <span className="font-medium">Demonstration</span>
        <span className="text-paper/70">
          Every person and company here is invented. Sign-up is closed, please don&rsquo;t enter
          real details.
        </span>
      </div>
    </div>
  );
}
