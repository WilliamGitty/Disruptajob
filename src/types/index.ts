// Core data model for Disruptajob.
// Shaped so a real database/API can be swapped in behind these same interfaces.

export type UserRole = "talent" | "employer";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  avatarInitials: string;
  createdAt: string;
}

export type AvailabilityStatus =
  | "open"
  | "selectively-open"
  | "not-looking";

export type EvidenceType =
  | "screenshot"
  | "demo-link"
  | "write-up"
  | "document"
  | "metric"
  | "testimonial";

export interface Evidence {
  id: string;
  type: EvidenceType;
  label: string;
  description?: string;
  url?: string;
}

/** A capability tag shared across the whole platform — the atomic unit employers search for. */
export interface CapabilityDefinition {
  tag: string;
  label: string;
  /** Which kind of work it is; the picker groups by this so the list reads as a map, not a wall. */
  group: string;
  description: string;
}

/** A capability as it exists on a specific candidate's profile, backed by evidence. */
export interface Capability {
  tag: string;
  label: string;
  /** 0-100, derived from volume + strength of supporting evidence. Never self-declared. */
  score: number;
  evidenceCount: number;
  projectIds: string[];
}

export interface ProjectProcessStep {
  title: string;
  description: string;
}

/**
 * A project's publication state.
 * - "published" (or undefined, for seeded/manually-added projects): live on the profile.
 * - "draft": imported from an external source (e.g. GitHub) and NOT yet live — the candidate
 *   must review, edit, and tag it with capabilities before it publishes. Draft projects never
 *   contribute to capability scores or appear to employers.
 */
export type ProjectStatus = "draft" | "published";

/** Where a project originated. Used to label drafts and keep import sources swappable. */
export type ProjectSource = "manual" | "github-import" | "cv-import";

export interface Project {
  id: string;
  slug: string;
  ownerId: string;
  title: string;
  description: string;
  thumbnailSeed: string;
  capabilities: string[]; // CapabilityDefinition tags
  tools: string[];
  evidence: Evidence[];
  outcome: string;
  // Detail page content
  problem: string;
  whatIBuilt: string;
  myContribution: string;
  process: ProjectProcessStep[];
  mediaGallery: string[]; // thumbnail seeds for abstract visuals
  demoUrl?: string;
  status?: ProjectStatus; // undefined === published (back-compat with seeded data)
  source?: ProjectSource;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  startDate: string;
  endDate: string | "Present";
}

export interface EducationEntry {
  institution: string;
  qualification: string;
  endYear: string;
}

export type WorkArrangement = "remote" | "hybrid" | "onsite";

/**
 * Intent data — what a candidate needs to consider a role. This is NOT proof data: it is
 * self-declared and must live separately from `capabilities[]`, which is only ever derived
 * from evidence. Comp floor is private and only ever used for future match filtering.
 */
export interface NonNegotiables {
  roleTypes: string[]; // role type / seniority open to
  compFloor?: string; // private, never shown to employers
  workArrangements: WorkArrangement[];
  locationConstraint?: string;
  dealbreakers: string[]; // e.g. "no on-call", "no 5-day RTO"
}

/**
 * Whether a profile can be found by employer search. Distinct from `availability` (which is a
 * stated openness signal). Defaults to "hidden": a complete profile is never discoverable until
 * the candidate explicitly opts in.
 */
export type Discoverability = "hidden" | "open" | "selectively-open";

export interface CandidateProfile {
  id: string;
  slug: string;
  userId: string;
  name: string;
  headline: string;
  shortDescription: string;
  /** Optional longer piece in their own words. Never scored — context for a human. */
  about?: string;
  location: string;
  availability: AvailabilityStatus;
  avatarInitials: string;
  accentIndex: number; // used to pick a deterministic accent treatment
  capabilities: Capability[];
  projectIds: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  nonNegotiables?: NonNegotiables;
  /** Defaults to "hidden" — profile is not discoverable to employers until explicitly opted in. */
  discoverability?: Discoverability;
  /** Company names / domains the candidate has blocked from ever seeing their profile. */
  blockedCompanies?: string[];
  /** Part of the invented demo population. Set by seeding only — no user path can ever set it. */
  isDemo?: boolean;
  /** A link to LinkedIn, shown in background. A link only: nothing behind it is read or scored. */
  linkedinUrl?: string;
}

export interface Employer {
  id: string;
  userId: string;
  companyName: string;
  companyBlurb: string;
}

// --- Company side ----------------------------------------------------------
//
// The mirror of the candidate model. Candidates don't write CVs here, they show projects; so
// companies don't write job descriptions here, they show the actual work a hire would own.
// `WorkExample` is deliberately shaped like `Project` — both carry capability tags, which makes
// matching a set overlap between proven capability and required capability rather than keyword
// guesswork.

export type CompanyStage = "pre-seed" | "seed" | "series-a" | "series-b" | "growth" | "established";

export interface CompanyProfile {
  id: string;
  slug: string;
  name: string;
  /** One line a candidate can actually understand — what the company does, plainly. */
  blurb: string;
  website?: string;
  stage?: CompanyStage;
  teamSize?: string;
  location?: string;
  avatarInitials: string;
  accentIndex: number;
  /** Whether the company has published — unpublished companies are invisible to candidates. */
  published?: boolean;
  /** Part of the invented demo population. Set by seeding only — no user path can ever set it. */
  isDemo?: boolean;
}

/** A file or link a company attaches to a work example (the real brief, a screenshot, a doc). */
export interface WorkAttachment {
  id: string;
  name: string;
  /** Present for links; file attachments in this prototype are recorded by name only. */
  url?: string;
  kind: "file" | "link";
}

/**
 * A real piece of work a hire would actually do — the company-side equivalent of a candidate's
 * project. This is what replaces the job description.
 */
export interface WorkExample {
  id: string;
  title: string;
  /** What the work is, in plain language. */
  description: string;
  /** Concrete things the person would actually do. */
  whatYoudDo: string[];
  /** Capability tags this work demands — matched against candidate evidence. */
  capabilities: string[];
  /** Rough horizon, e.g. "First 90 days". */
  timeframe?: string;
  attachments: WorkAttachment[];
}

/**
 * What a company is offering. The deliberate mirror of a candidate's `NonNegotiables`, so the two
 * can be compared directly and a mismatch surfaces before anyone wastes a conversation.
 */
export interface EmployerTerms {
  compRange?: string;
  workArrangements: WorkArrangement[];
  location?: string;
  startWindow?: string;
  /** Things the company genuinely can't flex on — the honest counterpart to deal-breakers. */
  constraints: string[];
}

export type RoleStatus = "draft" | "open" | "closed";

/** An opening, defined by the work it contains rather than by a title and a wish-list. */
export interface Role {
  id: string;
  companyId: string;
  title: string;
  /** Why this role exists at all — the business reason, not boilerplate. */
  whyThisRole: string;
  workExamples: WorkExample[];
  terms: EmployerTerms;
  status: RoleStatus;
  createdAt: string;
}

/** Where a candidate sits in a company's process. Ordered; used as the pipeline columns. */
export type PipelineStage = "reviewing" | "shortlisted" | "reached-out" | "talking";

export const PIPELINE_STAGES: PipelineStage[] = [
  "reviewing",
  "shortlisted",
  "reached-out",
  "talking",
];

export interface PipelineEntry {
  candidateId: string;
  stage: PipelineStage;
  /** Manual ordering within a column, so drag-and-drop position survives a reload. */
  position: number;
  roleId?: string;
  note?: string;
  updatedAt: string;
}

/**
 * Resumable company setup progress — the employer-side counterpart to `OnboardingDraft`.
 * Website enrichment may only ever write the context fields here, never a work example.
 */
export interface CompanySetupDraft {
  step: number;
  completedAt?: string;
  // Step 1 — company
  name: string;
  /** Who is setting this up. Becomes the account when the role is published. */
  contactEmail: string;
  website: string;
  blurb: string;
  stage?: CompanyStage;
  teamSize: string;
  location: string;
  websiteConnected: boolean;
  // Step 2 — the work
  roleTitle: string;
  whyThisRole: string;
  workExamples: WorkExample[];
  // Step 3 — terms
  terms: EmployerTerms;
  updatedAt: string;
}

export interface SearchBrief {
  id: string;
  employerId: string;
  roleTitle: string;
  mustDemonstrate: string[];
  niceToHave: string[];
  createdAt: string;
}

export type MatchStrength = "exploratory" | "solid" | "strong" | "high";

export interface MatchedRequirement {
  id: string;
  requirementLabel: string;
  matchedCapabilityTags: string[];
  evidenceProjectIds: string[];
  strength: MatchStrength;
  met: boolean;
}

export type TermsVerdict = "fits" | "conflicts" | "unknown";

/**
 * How an employer's stated terms line up against a candidate's non-negotiables.
 *
 * Carries verdicts only — never the candidate's `compFloor`. `notes` is employer-safe copy and
 * must never be built from the floor value itself.
 */
export interface TermsFit {
  compensation: TermsVerdict;
  workArrangement: TermsVerdict;
  notes: string[];
}

export interface CandidateMatch {
  candidateId: string;
  query: string;
  fitScore: number; // 0-100, always explainable via matchedRequirements
  matchedRequirements: MatchedRequirement[];
  supportingProjectCount: number;
  /** Intent-data fit. Deliberately NOT folded into fitScore, which means "proven by evidence". */
  termsFit: TermsFit;
}

/**
 * Partial onboarding progress, persisted so the flow is resumable — a candidate can leave
 * mid-flow and pick up where they left off. Imported background fields are kept here (and only
 * ever written from CV/LinkedIn import handlers); capabilities/evidence are NEVER stored here.
 */
export interface OnboardingDraft {
  step: number; // current step index, for resume
  completedAt?: string;
  // Step 1 — hook
  titleGap: string;
  // Step 2 — identity
  name: string;
  email: string;
  location: string;
  currentTitle: string;
  availability: AvailabilityStatus;
  // Step 3 — non-negotiables
  nonNegotiables: NonNegotiables;
  /**
   * Formerly a capability guess shown before any evidence existed. Removed — it fed no score and
   * only pre-ticked the boxes on imported work. Kept optional so saved drafts still parse.
   */
  hypothesisTags?: string[];
  // Step 5 — optional accelerators (background only; never capabilities/evidence)
  cvImported: boolean;
  /** Pasted CV text. Context for a human; never parsed into capabilities. */
  cvText?: string;
  /** Up to 500 words in their own words. Never scored. */
  about?: string;
  linkedinConnected: boolean;
  /** A link, not an import — LinkedIn does not permit reading profiles. */
  linkedinUrl?: string;
  githubConnected: boolean;
  importedExperience: ExperienceEntry[];
  importedEducation: EducationEntry[];
  // Step 9 — visibility
  discoverability: Discoverability;
  blockedCompanies: string[];
  updatedAt: string;
}

export type InviteStatus = "sent" | "viewed" | "accepted" | "declined";

/** A single turn in the conversation that an invite can grow into. */
export interface InviteMessage {
  id: string;
  from: "employer" | "candidate";
  body: string;
  createdAt: string;
}

export interface Invite {
  id: string;
  candidateId: string;
  employerId: string;
  roleTitle: string;
  companyName: string;
  message: string;
  compensationRange?: string;
  status: InviteStatus;
  createdAt: string;
  /** Set when the candidate accepts or declines. */
  respondedAt?: string;
  /** Replies after the employer's opening `message`, oldest first. */
  messages?: InviteMessage[];
}
