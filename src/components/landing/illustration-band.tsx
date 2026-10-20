import { Reveal } from "@/components/landing/reveal";
import { TitleVsWork } from "@/components/illustrations/title-vs-work";

/**
 * The thesis, drawn, in its own band below the opening. It used to share the hero; the founder
 * moved the argument up and the picture down, and asked for the picture to "slowly generate":
 * the title box arrives first, then the fan of lines, then the six work cards one by one, at
 * 350ms a piece instead of the site's snappy 90ms. The drawing assembles its argument in the
 * order the argument is made.
 *
 * Hidden below md: at phone width the drawing's labels shrink past legibility, and the written
 * argument above already carries the point.
 */
export function IllustrationBand() {
  return (
    <section className="hidden border-b border-ink/10 md:block">
      <div className="mx-auto max-w-[1100px] px-6 py-14 lg:px-10 lg:py-16">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          The whole argument, in one picture
        </p>
        <div className="relative">
          <div className="absolute -inset-4 border border-ink/10" aria-hidden />
          <Reveal className="w-full" stagger="svg > g, svg > text" step={350}>
            <TitleVsWork className="w-full" />
          </Reveal>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between border border-ink/10 bg-paper/95 px-4 py-3 text-xs">
            <span className="text-ink-faint">One line on a CV</span>
            <span className="font-medium text-ink">Six months of real work</span>
          </div>
        </div>
      </div>
    </section>
  );
}
