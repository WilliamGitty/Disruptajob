"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChipInput } from "@/components/ui/chip-input";
import { CapabilityPicker } from "@/components/ui/capability-picker";
import { addProject } from "@/server/actions/evidence";
import { isSafeHttpUrl } from "@/lib/project-input";

const MAX_SHORT = 140;
const MAX_LONG = 1000;

function urlFieldError(value: string): string | null {
  if (!value.trim()) return null;
  return isSafeHttpUrl(value.trim()) ? null : "Must be a valid http(s) link";
}

export function AddProjectModal({
  trigger,
}: {
  /** Override the default button — lets other surfaces (e.g. the evidence nudge) open this flow. */
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [whatIBuilt, setWhatIBuilt] = useState("");
  const [problem, setProblem] = useState("");
  const [outcome, setOutcome] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [capabilities, setCapabilities] = useState<string[]>([]);

  const repoError = urlFieldError(repoUrl);
  const demoError = urlFieldError(demoUrl);
  const canSubmit =
    title.trim() &&
    description.trim() &&
    whatIBuilt.trim() &&
    capabilities.length > 0 &&
    !repoError &&
    !demoError;

  function reset() {
    setTitle("");
    setDescription("");
    setWhatIBuilt("");
    setProblem("");
    setOutcome("");
    setRepoUrl("");
    setDemoUrl("");
    setTools([]);
    setCapabilities([]);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setTimeout(() => { setSaved(false); reset(); }, 200);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || saving) return;

    setSaving(true);
    setError(null);
    // The server owns slug generation, validation and capability tagging — it's the only writer
    // that can move a capability score, so it can't be bypassed from here.
    const result = await addProject({
      title,
      description,
      whatIBuilt,
      problem,
      outcome,
      repoUrl,
      demoUrl,
      tools,
      capabilities,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result.error ?? "Couldn't save that.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            Add project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        {saved ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center border border-evidence/30 bg-evidence-soft">
              <Check className="h-5 w-5 text-evidence" />
            </div>
            <h3 className="font-serif-display text-xl text-ink">Project added</h3>
            <p className="mt-2 max-w-sm text-sm text-ink-soft">
              It now shows up in your featured work. You can remove it any time.
            </p>
            <Button className="mt-6" variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add a project</DialogTitle>
              <DialogDescription>
                Link to something you built, with Claude Code, another AI tool, or by hand. Write the
                context yourself; we never fetch or run anything from the link.
              </DialogDescription>
            </DialogHeader>
            <form className="max-h-[60vh] space-y-5 overflow-y-auto pr-1" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="project-title">Title</Label>
                <Input
                  id="project-title"
                  required
                  maxLength={MAX_SHORT}
                  placeholder="AI-powered invoice triage"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description">One-line description</Label>
                <Input
                  id="project-description"
                  required
                  maxLength={MAX_SHORT}
                  placeholder="A tool that classifies and routes inbound invoices automatically."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project-repo">Repository link (optional)</Label>
                  <Input
                    id="project-repo"
                    type="url"
                    placeholder="https://github.com/you/project"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                  {repoError && <p className="text-xs text-red-600">{repoError}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-demo">Live demo link (optional)</Label>
                  <Input
                    id="project-demo"
                    type="url"
                    placeholder="https://your-demo.example.com"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                  />
                  {demoError && <p className="text-xs text-red-600">{demoError}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-what">What you built</Label>
                <Textarea
                  id="project-what"
                  required
                  rows={3}
                  maxLength={MAX_LONG}
                  value={whatIBuilt}
                  onChange={(e) => setWhatIBuilt(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-problem">Problem it solved (optional)</Label>
                <Textarea
                  id="project-problem"
                  rows={2}
                  maxLength={MAX_LONG}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-outcome">Outcome (optional)</Label>
                <Textarea
                  id="project-outcome"
                  rows={2}
                  maxLength={MAX_LONG}
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>What does this demonstrate?</Label>
                <p className="text-xs text-ink-faint">
                  Tag the capabilities this work proves. This is what moves your capability scores, nothing else does.
                </p>
                <CapabilityPicker selected={capabilities} onChange={setCapabilities} />
              </div>

              <div className="space-y-2">
                <Label>Tools used (optional)</Label>
                <ChipInput values={tools} onChange={setTools} placeholder="e.g. Claude Code" />
              </div>

              {error && (
                <p className="border border-accent/30 bg-accent-soft px-3 py-2 text-sm text-accent-dark">
                  {error}
                </p>
              )}
              <Button type="submit" variant="accent" className="w-full" disabled={!canSubmit || saving}>
                Add project
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
