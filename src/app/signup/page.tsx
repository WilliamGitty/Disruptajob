import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Heart, Lock } from "lucide-react";
import { signUpAction } from "@/server/actions/auth";
import { SIGNUP_ENABLED } from "@/server/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create an account — Disruptajob",
  description: "Free for candidates. Hidden until you choose otherwise.",
};
export const dynamic = "force-dynamic";

/**
 * Sign-up.
 *
 * A candidate arrives here wary — they're about to hand a website their work history while
 * employed somewhere else. So the reassurances sit next to the button, not on a separate page,
 * and the profile genuinely starts hidden rather than that being a promise we make.
 */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  const { error, role } = await searchParams;
  const isEmployer = role === "employer";

  if (!SIGNUP_ENABLED) {
    return (
      <main className="mx-auto max-w-[520px] px-6 py-20 text-center">
        <h1 className="font-serif-display text-3xl text-ink">Sign-up is closed here.</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          This is a demonstration — every profile on it is invented, and we&rsquo;d rather you
          didn&rsquo;t hand real employment details to a prototype. Sign in with one of the demo
          accounts to look around instead.
        </p>
        <Link href="/signin" className="mt-6 inline-block text-sm text-ink underline-grow">
          See the demo accounts
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[520px] px-6 py-16">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Create an account
      </p>
      <h1 className="font-serif-display text-3xl text-ink">
        {isEmployer ? "Hire for what people can do." : "Show the work, not the CV."}
      </h1>

      <div className="mt-6 flex border border-ink/15 p-0.5 text-sm font-medium">
        <RoleTab href="/signup" active={!isEmployer}>
          I&rsquo;m looking for work
        </RoleTab>
        <RoleTab href="/signup?role=employer" active={isEmployer}>
          I&rsquo;m hiring
        </RoleTab>
      </div>

      <form action={signUpAction} className="mt-8 space-y-5">
        <input type="hidden" name="role" value={isEmployer ? "employer" : "talent"} />

        <div className="space-y-2">
          <Label htmlFor="name">{isEmployer ? "Company name" : "Your name"}</Label>
          <Input
            id="name"
            name="name"
            required
            autoComplete={isEmployer ? "organization" : "name"}
            placeholder={isEmployer ? "Meridian Robotics" : "Alex Okafor"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
          {!isEmployer && (
            <p className="text-xs text-ink-faint">
              Use a personal address, not your work one — your current employer should never be
              able to connect this to you.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
          />
          <p className="text-xs text-ink-faint">At least 10 characters.</p>
        </div>

        {error && (
          <p className="border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-accent-dark">
            {error}
          </p>
        )}

        <Button type="submit" variant="accent" className="w-full">
          {isEmployer ? "Create company account" : "Create my account"}
        </Button>
      </form>

      {!isEmployer && (
        <ul className="mt-8 space-y-3 border-t border-ink/10 pt-6 text-sm text-ink-soft">
          <Reassurance icon={<Heart className="h-3.5 w-3.5" />}>
            Free, always — companies pay, you don&rsquo;t
          </Reassurance>
          <Reassurance icon={<Eye className="h-3.5 w-3.5" />}>
            Your profile starts hidden. Nobody can find you until you switch it on.
          </Reassurance>
          <Reassurance icon={<Lock className="h-3.5 w-3.5" />}>
            You can block named companies, so a job search never costs you the job you have.
          </Reassurance>
        </ul>
      )}

      <p className="mt-8 text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/signin" className="text-ink underline-grow">
          Sign in
        </Link>
      </p>
    </main>
  );
}

function RoleTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex-1 px-4 py-2 text-center transition-colors",
        active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
      )}
    >
      {children}
    </Link>
  );
}

function Reassurance({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 text-evidence">{icon}</span>
      {children}
    </li>
  );
}
