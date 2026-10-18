import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Lock } from "lucide-react";
import { getCurrentAccount } from "@/server/auth";
import { VerifyEmailNotice } from "@/components/settings/verify-email-notice";
import { getCandidateById } from "@/server/repositories/candidates";
import { updateBasics, updateTerms, updateVisibility } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { YourData } from "@/components/settings/your-data";
import { cn } from "@/lib/utils";
import type { Discoverability } from "@/types";

export const metadata: Metadata = { title: "Your settings · Disruptajob" };
export const dynamic = "force-dynamic";

const VISIBILITY: { value: Discoverability; label: string; body: string }[] = [
  {
    value: "hidden",
    label: "Hidden",
    body: "No employer can find you in search, and your profile page is visible to nobody but you.",
  },
  {
    value: "selectively-open",
    label: "Selectively open",
    body: "Discoverable, but you review every approach before anything happens.",
  },
  {
    value: "open",
    label: "Open",
    body: "Fully discoverable to employers searching for the capabilities you've evidenced.",
  },
];

/**
 * Your profile controls.
 *
 * Visibility comes first on the page deliberately — it's the thing people come here worried
 * about, and burying it under profile fields would be its own kind of dark pattern.
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ verification?: string; saved?: string }>;
}) {
  const { verification, saved } = await searchParams;
  const savedNote = (
    <p className="mt-4 inline-flex items-center gap-2 border border-evidence/30 bg-evidence-soft px-3 py-1.5 text-sm text-ink">
      Changes saved.
    </p>
  );
  const account = await getCurrentAccount();

  if (!account?.candidateId) {
    return (
      <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <h1 className="font-serif-display text-2xl text-ink">Sign in to manage your profile</h1>
        <Link href="/signin" className="mt-6 inline-block text-sm text-ink underline-grow">
          Go to sign in
        </Link>
      </main>
    );
  }

  const me = getCandidateById(account.candidateId);
  if (!me) {
    return (
      <main className="mx-auto max-w-[700px] px-6 py-24 text-center">
        <p className="text-sm text-ink-soft">We couldn&rsquo;t load your profile.</p>
      </main>
    );
  }

  const current = me.discoverability ?? "hidden";
  const nn = me.nonNegotiables;

  return (
    <main className="mx-auto max-w-[760px] px-6 py-14 lg:py-20">
      <VerifyEmailNotice accountId={account.id} email={account.email} sent={verification === "sent"} />
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Your settings
      </p>
      <h1 className="font-serif-display text-3xl text-ink sm:text-4xl">
        You decide who sees this.
      </h1>

      {/* --- Visibility --- */}
      <section className="mt-10 border border-ink/10 p-7">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-evidence" />
          <h2 className="font-serif-display text-xl text-ink">Who can find you</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Change this whenever you like. Turning yourself hidden takes effect immediately and
          removes you from every employer&rsquo;s search and saved lists.
        </p>

        {saved === "visibility" && savedNote}
        <form action={updateVisibility} className="mt-6 space-y-5">
          <div className="space-y-2">
            {VISIBILITY.map((o) => (
              <label
                key={o.value}
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 border p-4 text-left transition-colors",
                  current === o.value ? "border-accent bg-accent-soft" : "border-ink/15 hover:border-ink"
                )}
              >
                <input
                  type="radio"
                  name="discoverability"
                  value={o.value}
                  defaultChecked={current === o.value}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-ink">{o.label}</span>
                  <span className="block text-xs text-ink-faint">{o.body}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="blockedCompanies">Hide from these companies</Label>
            <Textarea
              id="blockedCompanies"
              name="blockedCompanies"
              rows={4}
              placeholder={"Your current employer\nAnyone else you'd rather not see this"}
              defaultValue={(me.blockedCompanies ?? []).join("\n")}
            />
            <p className="flex items-start gap-2 text-xs text-ink-faint">
              <Lock className="mt-0.5 h-3 w-3 shrink-0" />
              One company per line. They won&rsquo;t appear in your search results and you
              won&rsquo;t appear in theirs, they&rsquo;re never told you blocked them.
            </p>
          </div>

          <Button type="submit" variant="accent">
            Save visibility
          </Button>
        </form>
      </section>

      {/* --- Terms --- */}
      <section className="mt-8 border border-ink/10 p-7">
        <h2 className="font-serif-display text-xl text-ink">What you need from a role</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Employers see everything here <em>except</em> your minimum, we only ever tell them
          whether their budget clears it.
        </p>

        {saved === "terms" && savedNote}
        <form action={updateTerms} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="compFloor">Your minimum (private)</Label>
              <Input
                id="compFloor"
                name="compFloor"
                placeholder="£70,000"
                defaultValue={nn?.compFloor ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationConstraint">Location</Label>
              <Input
                id="locationConstraint"
                name="locationConstraint"
                placeholder="London or UK remote"
                defaultValue={nn?.locationConstraint ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Arrangements you&rsquo;d accept</Label>
            <div className="flex flex-wrap gap-4">
              {(["remote", "hybrid", "onsite"] as const).map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    name={`arrangement-${a}`}
                    defaultChecked={nn?.workArrangements?.includes(a)}
                  />
                  <span className="capitalize">{a}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleTypes">Roles you&rsquo;re open to</Label>
            <Textarea
              id="roleTypes"
              name="roleTypes"
              rows={3}
              placeholder={"Head of Operations\nAI Enablement Lead"}
              defaultValue={(nn?.roleTypes ?? []).join("\n")}
            />
            <p className="text-xs text-ink-faint">One per line.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dealbreakers">Deal-breakers</Label>
            <Textarea
              id="dealbreakers"
              name="dealbreakers"
              rows={3}
              placeholder={"No 5-day return-to-office\nNo on-call rota"}
              defaultValue={(nn?.dealbreakers ?? []).join("\n")}
            />
          </div>

          <Button type="submit" variant="accent">
            Save terms
          </Button>
        </form>
      </section>

      {/* --- Basics --- */}
      <section className="mt-8 border border-ink/10 p-7">
        <h2 className="font-serif-display text-xl text-ink">Your profile</h2>

        {saved === "basics" && savedNote}
        <form action={updateBasics} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={me.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Where you are</Label>
              <Input id="location" name="location" defaultValue={me.location} placeholder="London, UK" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">
                LinkedIn URL <span className="text-ink-faint">(optional)</span>
              </Label>
              <Input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                defaultValue={me.linkedinUrl ?? ""}
                placeholder="https://linkedin.com/in/you"
              />
              <p className="text-xs text-ink-faint">
                Shown as a link in your background. We never read or score anything behind it.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              name="headline"
              defaultValue={me.headline}
              placeholder="Events · Community · Training"
            />
            <p className="text-xs text-ink-faint">
              The things you actually do, not the title on your contract.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">In a sentence</Label>
            <Textarea
              id="shortDescription"
              name="shortDescription"
              rows={2}
              defaultValue={me.shortDescription}
              placeholder="I run the workshops, events and community that keep our members coming back."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <select
              id="availability"
              name="availability"
              defaultValue={me.availability}
              className="h-11 w-full border border-ink/15 bg-paper px-3 text-sm text-ink"
            >
              <option value="open">Open to opportunities</option>
              <option value="selectively-open">Selectively open</option>
              <option value="not-looking">Not currently looking</option>
            </select>
          </div>

          <Button type="submit" variant="accent">
            Save profile
          </Button>
        </form>
      </section>

      <YourData email={account.email} />

      <p className="mt-8 text-sm text-ink-soft">
        <Link href={`/profile/${me.slug}`} className="text-ink underline-grow">
          View your profile as others see it
        </Link>
      </p>
    </main>
  );
}
