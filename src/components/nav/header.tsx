"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/server/actions/auth";

const EMPLOYER_HOME = "/employer";

function talentLinks(talentHome: string) {
  return [
    { label: "My work", href: `${talentHome}#work` },
    { label: "My profile", href: talentHome },
    { label: "Add work", href: "/talent/onboarding" },
    // Named for what it feels like to receive, not for the system object behind it.
    { label: "Who's interested", href: "/talent/opportunities" },
    { label: "Settings", href: "/talent/settings" },
  ];
}

const EMPLOYER_LINKS = [
  { label: "Find people", href: EMPLOYER_HOME },
  { label: "Your role", href: "/employer/setup" },
  { label: "Pipeline", href: "/employer/pipeline" },
  { label: "Saved", href: "/employer/saved" },
  { label: "Conversations", href: "/employer/responses" },
  { label: "Account", href: "/employer/settings" },
];

export function Header({
  awaiting = 0,
  signedInAs,
  talentHome = "/talent/onboarding",
}: {
  /** How many items need this account's response — counted on the server. */
  awaiting?: number;
  signedInAs?: { name: string; role: "talent" | "employer" };
  talentHome?: string;
}) {
  const pathname = usePathname();
  const isEmployer = pathname?.startsWith("/employer");
  const links = isEmployer ? EMPLOYER_LINKS : talentLinks(talentHome);
  // Remember which route the menu was opened on, so navigating away closes it by derivation
  // rather than by syncing state in an effect.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const menuOpen = openedAt !== null && openedAt === pathname;
  const setMenuOpen = (next: boolean) => setOpenedAt(next ? pathname : null);

  const badgedHref = isEmployer ? "/employer/responses" : "/talent/opportunities";

  if (pathname === "/") {
    return (
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <Logo />
          {/* Two doors, labelled by what the visitor is here to do rather than by our jargon,
              plus the pages that let a careful visitor take our measure before trusting us. */}
          <nav className="flex items-center gap-5">
            <Link href="/about" className="hidden text-sm text-ink-faint underline-grow lg:inline">
              About
            </Link>
            <Link href="/articles" className="hidden text-sm text-ink-faint underline-grow lg:inline">
              Articles
            </Link>
            <Link href="/faq" className="hidden text-sm text-ink-faint underline-grow lg:inline">
              FAQ
            </Link>
            <Link
              href="/talent/onboarding"
              className="hidden text-sm text-ink-soft underline-grow sm:inline"
            >
              I&rsquo;m looking for work
            </Link>
            <Link href={EMPLOYER_HOME}>
              <span className="inline-flex h-10 items-center border border-ink/20 px-5 text-sm font-medium text-ink transition-colors hover:border-ink">
                I&rsquo;m hiring
              </span>
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-6 lg:px-10">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => {
              const active = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== talentHome && link.href !== EMPLOYER_HOME);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 text-[13px] font-medium tracking-wide transition-colors",
                    active ? "text-ink" : "text-ink-faint hover:text-ink"
                  )}
                >
                  {link.label}
                  {link.href === badgedHref && awaiting > 0 && <CountDot count={awaiting} />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ModeToggle isEmployer={Boolean(isEmployer)} talentHome={talentHome} signedInAs={signedInAs} />
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center border border-ink/15 text-ink md:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-ink/10 bg-paper px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => {
              const active = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== talentHome && link.href !== EMPLOYER_HOME);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 text-sm font-medium tracking-wide transition-colors",
                    active ? "text-ink" : "text-ink-faint hover:text-ink"
                  )}
                >
                  {link.label}
                  {link.href === badgedHref && awaiting > 0 && <CountDot count={awaiting} />}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

/** Count of items waiting on you — not an unread count. */
function CountDot({ count }: { count: number }) {
  return (
    <span
      aria-label={`${count} awaiting your response`}
      className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold leading-none text-paper"
    >
      {count}
    </span>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image
        src="/logo-mark.jpg"
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 rounded-sm"
      />
      <span className="font-serif-display text-lg tracking-tight text-ink">Disruptajob</span>
    </Link>
  );
}

function ModeToggle({
  isEmployer,
  talentHome,
  signedInAs,
}: {
  isEmployer: boolean;
  talentHome: string;
  signedInAs?: { name: string; role: "talent" | "employer" };
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-ink/15 p-0.5 text-[13px] font-medium">
        <Link
          href={talentHome}
          className={cn(
            "px-3.5 py-1.5 transition-colors",
            !isEmployer ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
          )}
        >
          Looking
        </Link>
        <Link
          href={EMPLOYER_HOME}
          className={cn(
            "px-3.5 py-1.5 transition-colors",
            isEmployer ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
          )}
        >
          Hiring
        </Link>
      </div>

      {/* Who you are is now a real thing that can be wrong, so it's always on screen. */}
      {signedInAs ? (
        <form action={signOutAction} className="hidden items-center gap-2 sm:flex">
          <span className="text-[13px] text-ink-faint">{signedInAs.name}</span>
          <button type="submit" className="text-[13px] text-ink-soft underline-grow">
            Sign out
          </button>
        </form>
      ) : (
        <Link href="/signin" className="hidden text-[13px] text-ink-soft underline-grow sm:inline">
          Sign in
        </Link>
      )}
    </div>
  );
}
