import type { Metadata } from "next";
import { SetupFlow } from "@/components/employer-setup/setup-flow";

export const metadata: Metadata = {
  title: "Set up hiring — Disruptajob",
  description:
    "Describe the real work a hire would own instead of writing a job description, and see who already has evidence for it.",
};

export default function EmployerSetupPage() {
  return (
    <main>
      <SetupFlow />
    </main>
  );
}
