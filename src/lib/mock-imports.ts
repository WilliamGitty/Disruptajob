// Stubbed external import sources (no real OAuth / network).
//
// This module is the ONLY place "connect GitHub / LinkedIn / upload CV" data comes from, so
// swapping in real integrations later is a contained change. The field-level trust boundary is
// enforced by the return TYPES, not by convention:
//
//   - CV + LinkedIn return `BackgroundImport` — experience/education ONLY. There is no field on
//     that type for capabilities, scores, or evidence, so an import handler physically cannot
//     populate them.
//   - GitHub returns DRAFT projects with `capabilities: []` and `evidence: []`. Nothing is live
//     and nothing is scored until the candidate reviews, tags, and confirms each one.

import type { EducationEntry, ExperienceEntry, Project } from "@/types";

/** Simulate the latency of a real connect/parse round-trip so the UI can show a loading state. */
export function fakeLatency(ms = 1100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Background-only payload. Deliberately has NO capabilities/evidence/score fields — this is the
 * type-level guarantee that CV and LinkedIn imports can only ever touch context data.
 */
export interface BackgroundImport {
  experience: ExperienceEntry[];
  education: EducationEntry[];
}

const MOCK_LINKEDIN: BackgroundImport = {
  experience: [
    { company: "Brightwave Logistics", role: "Operations Associate", startDate: "2022", endDate: "Present" },
    { company: "Finch & Co.", role: "Operations Analyst", startDate: "2020", endDate: "2022" },
  ],
  education: [
    { institution: "University of Manchester", qualification: "BSc Economics", endYear: "2020" },
  ],
};

const MOCK_CV: BackgroundImport = {
  experience: [
    { company: "Brightwave Logistics", role: "Operations Associate", startDate: "2022", endDate: "Present" },
    { company: "Finch & Co.", role: "Operations Analyst", startDate: "2020", endDate: "2022" },
    { company: "Harrow Retail Group", role: "Graduate Intern", startDate: "2019", endDate: "2020" },
  ],
  education: [
    { institution: "University of Manchester", qualification: "BSc Economics", endYear: "2020" },
  ],
};

/** Connect LinkedIn — returns background fields only. */
export async function importFromLinkedIn(): Promise<BackgroundImport> {
  await fakeLatency();
  return structuredClone(MOCK_LINKEDIN);
}

/** Upload / parse a CV — returns background fields only. */
export async function importFromCv(): Promise<BackgroundImport> {
  await fakeLatency(1400);
  return structuredClone(MOCK_CV);
}

/** A repo as it comes back from a (stubbed) GitHub connection, before becoming a draft project. */
interface MockRepo {
  name: string;
  description: string;
  /** Stand-in for a README-derived summary the real integration would extract. */
  readmeSummary: string;
  demoUrl?: string;
  repoUrl: string;
}

const MOCK_REPOS: MockRepo[] = [
  {
    name: "invoice-triage",
    description: "Classifies and routes inbound invoices automatically.",
    readmeSummary:
      "A small service that reads inbound invoice emails, extracts line items, classifies them against a chart of accounts, and routes each to the right approver. Built to replace a manual triage step that took the finance team ~2 hours a day.",
    repoUrl: "https://github.com/example/invoice-triage",
  },
  {
    name: "standup-digest",
    description: "Turns scattered Slack updates into a single morning digest.",
    readmeSummary:
      "Collects async standup messages across channels overnight and composes a single, skimmable digest posted to the leadership channel each morning. Handles threading, deduplication, and a lightweight importance score.",
    demoUrl: "https://standup-digest.example.com",
    repoUrl: "https://github.com/example/standup-digest",
  },
  {
    name: "ops-dashboard",
    description: "Live dashboard of the metrics the ops team actually acts on.",
    readmeSummary:
      "Pulls from three internal systems into one dashboard of the handful of operational metrics the team reviews daily, with threshold alerts. Replaced a weekly spreadsheet that was always a few days stale.",
    repoUrl: "https://github.com/example/ops-dashboard",
  },
];

/**
 * Connect GitHub — returns DRAFT projects. Each carries `capabilities: []` and `evidence: []`;
 * the candidate tags and confirms them later. `ownerId`/`slug` are assigned so they slot into
 * the same custom-projects store as manually-added work.
 */
export async function importFromGitHub(ownerId: string): Promise<Project[]> {
  await fakeLatency(1300);
  return MOCK_REPOS.map((repo, i) => {
    const slug = repo.name;
    const id = `gh-${Date.now()}-${i}`;
    return {
      id,
      slug,
      ownerId,
      title: repo.name
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      description: repo.description,
      thumbnailSeed: slug,
      capabilities: [], // candidate tags these during review, never pre-filled by the import
      tools: [],
      evidence: [], // import never fabricates evidence
      outcome: "",
      problem: "",
      whatIBuilt: repo.readmeSummary,
      myContribution: "",
      process: [],
      mediaGallery: [slug],
      demoUrl: repo.demoUrl,
      status: "draft",
      source: "github-import",
    } satisfies Project;
  });
}
