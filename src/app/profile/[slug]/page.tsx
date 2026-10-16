import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCandidateBySlug } from "@/server/repositories/candidates";
import { viewerMaySeeCandidate } from "@/server/candidate-gate";
import { getCurrentAccount } from "@/server/auth";
import { isCandidateVisibleTo } from "@/server/repositories/discovery";
import { getCompanyById } from "@/server/repositories/companies";
import {
  listProjectsForCandidate,
  listPublishedProjects,
} from "@/server/repositories/projects";
import { ProfileHeader } from "@/components/profile/profile-header";
import { FeaturedWorkSection } from "@/components/profile/featured-work-section";
import { CapabilitiesSection } from "@/components/profile/capabilities-section";
import { BackgroundSection } from "@/components/profile/background-section";
import { EvidenceNudge } from "@/components/profile/evidence-nudge";
import { PortfolioCoach } from "@/components/profile/portfolio-coach";
import { DemandPanel } from "@/components/profile/demand-panel";
import { demandFor } from "@/server/repositories/demand";

// Profiles come from the database and change as people add evidence, so they're rendered per
// request rather than prerendered at build.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const candidate = getCandidateBySlug(slug);
  if (!candidate) return {};
  // Metadata renders even into a 404 response, so it needs the page's own gate.
  if (!(await viewerMaySeeCandidate(candidate.id))) return {};
  return {
    title: `${candidate.name} — Disruptajob`,
    description: candidate.headline || candidate.shortDescription,
    alternates: { canonical: `/profile/${candidate.slug}` },
    openGraph: {
      title: `${candidate.name} — ${candidate.headline || "Disruptajob"}`,
      description: candidate.shortDescription,
      type: "profile",
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const candidate = getCandidateBySlug(slug);
  if (!candidate) notFound();

  const viewer = await getCurrentAccount();
  const isOwnProfile = viewer?.candidateId === candidate.id;

  /*
   * The gate the privacy policy promises. Audit finding S1: this page previously rendered any
   * profile to anyone — a hidden candidate's work was one guessable slug away from the employer
   * they were hiding from, while /privacy said the opposite.
   *
   * Non-owners pass the same check search uses. A signed-in employer is checked against the
   * candidate's blocklist by name; everyone else is "no company", which can't match a blocklist
   * but still never sees a hidden profile. 404 rather than 403 — a denial that confirms the
   * profile exists would itself leak.
   */
  if (!isOwnProfile) {
    const viewerCompany = viewer?.companyId ? getCompanyById(viewer.companyId)?.name ?? "" : "";
    if (!isCandidateVisibleTo(candidate.id, viewerCompany)) notFound();
  }

  // Your own drafts are yours to see; everyone else gets published work only.
  const projects = isOwnProfile
    ? listProjectsForCandidate(candidate.id)
    : listPublishedProjects(candidate.id);

    const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: candidate.name,
      jobTitle: candidate.headline || undefined,
      description: candidate.shortDescription || undefined,
      url: `https://disruptajob.com/profile/${candidate.slug}`,
    },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      {/* The nudge is for your own profile only — nobody needs prompting about someone else's. */}
      {isOwnProfile && <EvidenceNudge candidate={candidate} />}
      <ProfileHeader candidate={candidate} isOwnProfile={isOwnProfile} />
      <FeaturedWorkSection
        candidate={candidate}
        projects={projects}
        isOwnProfile={isOwnProfile}
      />
      <CapabilitiesSection candidate={candidate} projects={projects} />

      {/* Placed after the capability graph: you should see what you've built before being told
          what would strengthen it. Owner only — nobody else sees how someone was advised. */}
      {isOwnProfile && (
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-6 pb-4 lg:grid-cols-2 lg:px-10">
          <PortfolioCoach candidate={candidate} projects={projects} />
          <DemandPanel demand={demandFor(candidate)} ownerFirstName={candidate.name.split(" ")[0]} />
        </div>
      )}

      <BackgroundSection candidate={candidate} />
    </main>
  );
}
