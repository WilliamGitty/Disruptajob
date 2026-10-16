import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center lg:px-10">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-accent" />
          <span className="font-serif-display text-base text-ink">Disruptajob</span>
        </div>
        <p className="max-w-sm text-sm text-ink-faint">
          Judge the work before you judge the paper.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-faint">
          <Link href="/profile/jordan-blake" className="underline-grow hover:text-ink">
            Example profile
          </Link>
          <Link href="/employer" className="underline-grow hover:text-ink">
            For employers
          </Link>
          <Link href="/privacy" className="underline-grow hover:text-ink">
            Privacy
          </Link>
          <Link href="/terms" className="underline-grow hover:text-ink">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
