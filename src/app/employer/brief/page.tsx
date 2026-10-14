"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChipInput } from "@/components/ui/chip-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const DEFAULT_MUST = ["Internal AI implementation", "Automation", "Working with senior stakeholders", "Rapid prototyping", "Communication"];
const DEFAULT_NICE = ["Startup experience", "London-based"];

export default function RoleBriefPage() {
  const router = useRouter();
  const [roleTitle, setRoleTitle] = useState("AI Operations Manager");
  const [mustDemonstrate, setMustDemonstrate] = useState<string[]>(DEFAULT_MUST);
  const [niceToHave, setNiceToHave] = useState<string[]>(DEFAULT_NICE);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = [
      roleTitle && `Looking for a ${roleTitle}.`,
      mustDemonstrate.length && `They need to demonstrate: ${mustDemonstrate.join(", ")}.`,
      niceToHave.length && `Nice to have: ${niceToHave.join(", ")}.`,
    ]
      .filter(Boolean)
      .join(" ");
    router.push(`/employer/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <main>
      <div className="mx-auto max-w-[700px] px-6 py-16 lg:px-10 lg:py-20">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          Role brief
        </p>
        <h1 className="font-serif-display text-3xl text-ink sm:text-4xl">
          Describe what this person needs to prove.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
          No lengthy job description. Just the capabilities that actually matter for this role —
          we&rsquo;ll surface people who can prove them.
        </p>

        <form onSubmit={handleSubmit} className="mt-12 space-y-10">
          <div className="space-y-2">
            <Label htmlFor="role-title">Role</Label>
            <Input
              id="role-title"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="AI Operations Manager"
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>What this person needs to demonstrate</Label>
            <ChipInput
              values={mustDemonstrate}
              onChange={setMustDemonstrate}
              placeholder="e.g. Rapid prototyping"
            />
          </div>

          <div className="space-y-2">
            <Label>Nice to have</Label>
            <ChipInput values={niceToHave} onChange={setNiceToHave} placeholder="e.g. Startup experience" />
          </div>

          <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto">
            Find matching people
          </Button>
        </form>
      </div>
    </main>
  );
}
