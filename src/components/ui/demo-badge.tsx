/**
 * Marks a member of the invented demo population.
 *
 * The moment real people share the database with seeded fiction, an unlabelled example profile
 * becomes a lie — to a candidate sizing up the competition, and to an employer about to spend
 * attention on someone who doesn't exist. The flag it renders is set by seeding only; there is
 * deliberately no user path that can produce it.
 */
export function DemoBadge({ kind = "profile" }: { kind?: "profile" | "company" }) {
  return (
    <span className="inline-flex shrink-0 items-center border border-ink/20 bg-paper-dim px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-soft">
      Example {kind}
    </span>
  );
}
