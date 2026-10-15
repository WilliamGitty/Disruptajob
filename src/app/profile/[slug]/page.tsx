import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCandidateBySlug } from "@/server/repositories/candidates";
import { getCurrentAccount } from "@/server/auth";
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
  return {
    title: `${candidate.name} — Disruptajob`,
    description: candidate.shortDescription,
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

  // Your own drafts are yours to see; everyone else gets published work only.
  const projects = isOwnProfile
    ? listProjectsForCandidate(candidate.id)
    : listPublishedProjects(candidate.id);

  return (
    <main>
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
        <div className="mx-auto max-w-[1400px] px-6 pb-4 lg:px-10">
          <PortfolioCoach candidate={candidate} projects={projects} />
        </div>
      )}

      <BackgroundSection candidate={candidate} />
    </main>
  );
}
