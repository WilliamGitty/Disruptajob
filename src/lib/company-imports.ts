// Stubbed company enrichment ("connect your website"). No real network or scraping.
//
// Same trust boundary as the candidate-side imports in `mock-imports.ts`, enforced by the return
// TYPE rather than by convention: `CompanyContextImport` has no field for work examples, roles or
// terms. A company's actual work must be written by a human who knows the job — if a scrape could
// populate it, employers would ship whatever marketing copy their homepage happens to carry, and
// the matching signal would be exactly as worthless as a job description.

import { fakeLatency } from "./mock-imports";
import type { CompanyStage } from "@/types";

/**
 * Context fields only. Deliberately cannot carry `workExamples` — see the note above.
 * `suggestedCapabilities` is a *prompt* for the human, never applied automatically.
 */
export interface CompanyContextImport {
  name: string;
  blurb: string;
  stage?: CompanyStage;
  teamSize: string;
  location: string;
  /** Hints to pre-tick in the picker. The person still confirms every one. */
  suggestedCapabilities: string[];
}

const PROFILES: Record<string, CompanyContextImport> = {
  "meridianrobotics.com": {
    name: "Meridian Robotics",
    blurb:
      "We build the software that runs automated warehouses — routing, dispatch and the systems that keep physical goods moving.",
    stage: "series-b",
    teamSize: "120–180",
    location: "London, UK",
    suggestedCapabilities: ["operations", "automation", "systems-thinking"],
  },
  "halcyonsystems.io": {
    name: "Halcyon Systems",
    blurb:
      "A small team replacing the spreadsheets and manual admin that mid-market operations teams still run on.",
    stage: "seed",
    teamSize: "12–20",
    location: "Remote (UK/EU)",
    suggestedCapabilities: ["automation", "workflow-design", "rapid-prototyping"],
  },
};

/** Fallback for any domain we don't have a canned profile for. */
function genericProfile(domain: string): CompanyContextImport {
  const bare = domain.replace(/^www\./, "").split(".")[0] ?? "Your company";
  const name = bare
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    name,
    blurb: "",
    teamSize: "",
    location: "",
    suggestedCapabilities: [],
  };
}

/** Normalise whatever someone pastes — "https://Foo.com/about" → "foo.com". */
export function normaliseDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

/**
 * "Connect your website" — returns context fields a human then edits.
 * Never returns work examples, roles or terms.
 */
export async function importFromWebsite(url: string): Promise<CompanyContextImport> {
  await fakeLatency(1300);
  const domain = normaliseDomain(url);
  const known = PROFILES[domain];
  return structuredClone(known ?? genericProfile(domain));
}
