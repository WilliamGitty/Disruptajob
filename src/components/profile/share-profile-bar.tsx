"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * The portable-evidence action: your profile as a link you can paste into applications,
 * LinkedIn, an email signature — value that exists today, with or without an employer finding
 * you here.
 *
 * Honesty requirement: a hidden profile's link only opens for its owner. Offering a share
 * button without saying that would hand people a link that 404s for everyone they send it to,
 * so the hidden state explains itself and points at settings instead of pretending.
 */
export function ShareProfileBar({ slug, hidden }: { slug: string; hidden: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `https://disruptajob.com/profile/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard can be unavailable (permissions, http); the prompt is the universal fallback.
      window.prompt("Copy your profile link:", url);
    }
  }

  return (
    <div className="border-b border-ink/10 bg-paper-dim">
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-3 px-6 py-3 lg:px-10">
        <p className="text-sm text-ink-soft">
          {hidden ? (
            <>
              This page is your evidence link, but it&rsquo;s{" "}
              <strong className="text-ink">hidden</strong>, so right now it only opens for you.{" "}
              <Link href="/talent/settings" className="text-ink underline-grow">
                Decide who can see it
              </Link>
            </>
          ) : (
            <>
              This link works anywhere: applications, LinkedIn, your CV. Evidence beats
              &ldquo;see attached&rdquo;.
            </>
          )}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? (
            <>
              Copied <Check className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Copy your profile link <LinkIcon className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
