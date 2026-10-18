"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
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

  // On public pages, a visitor gets the public header: content links and the two doors. The
  // app navigation (My work, Settings, ...) is a row of dead ends to anyone without an account,
  // and a signed-in person on a public page still has both doors home.
  const PUBLIC_PREFIXES = ["/about", "/articles", "/guides", "/faq", "/community", "/people", "/privacy", "/terms", "/signin", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/company"];
  const isPublicPage = pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname?.startsWith(p));

  if (isPublicPage) {
    return (
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <Logo />
          {/* Two doors, labelled by what the visitor is here to do rather than by our jargon,
              plus the pages that let a careful visitor take our measure before trusting us. */}
          <nav className="flex items-center gap-5">
            <Link href="/community" className="hidden text-sm text-ink-faint underline-grow lg:inline">
              Community
            </Link>
            <Link href="/about" className="hidden text-sm text-ink-faint underline-grow lg:inline">
              About
            </Link>
            <Link href="/articles" className="hidden text-sm text-ink-faint underline-grow lg:inline">
              Articles
            </Link>
            <Link href="/guides" className="hidden text-sm text-ink-faint underline-grow lg:inline">
              Guides
            </Link>
            <Link href="/faq" className="hidden text-sm text-ink-faint underline-grow lg:inline">
              FAQ
            </Link>
            {signedInAs ? (
              // A signed-in person on a public page keeps their way home: the mode toggle
              // carries Looking/Hiring, their name, and sign out.
              <ModeToggle isEmployer={Boolean(isEmployer)} talentHome={talentHome} signedInAs={signedInAs} />
            ) : (
              <>
                <Link
                  href={EMPLOYER_HOME}
                  className="hidden text-sm text-ink-soft underline-grow sm:inline"
                >
                  I&rsquo;m hiring
                </Link>
                <Link href="/signin" className="text-sm text-ink-soft underline-grow">
                  Sign in
                </Link>
                <Link href="/talent/onboarding">
                  <span className="inline-flex h-9 items-center border border-ink/20 px-3.5 text-sm font-medium text-ink transition-colors hover:border-ink sm:h-10 sm:px-5">
                    Create an account
                  </span>
                </Link>
              </>
            )}
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

/**
 * The "me" menu. One stable place that always leads back to your own things, from any page —
 * added after the founder, signed in on the homepage, had no path back to his own profile.
 */
function AccountMenu({
  signedInAs,
  talentHome,
}: {
  signedInAs: { name: string; role: "talent" | "employer" };
  talentHome: string;
}) {
  const [open, setOpen] = useState(false);
  const items =
    signedInAs.role === "talent"
      ? [
          { label: "My profile", href: talentHome },
          { label: "My work", href: `${talentHome}#work` },
          { label: "Add work", href: "/talent/onboarding" },
          { label: "Job roles available", href: "/talent/matches" },
          { label: "Who's interested", href: "/talent/opportunities" },
          { label: "My settings", href: "/talent/settings" },
        ]
      : [
          { label: "Find people", href: "/employer" },
          { label: "Your role", href: "/employer/setup" },
          { label: "Pipeline", href: "/employer/pipeline" },
          { label: "Conversations", href: "/employer/responses" },
          { label: "Account settings", href: "/employer/settings" },
        ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 border border-ink/15 px-2.5 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-ink/40 sm:px-3"
      >
        <span className="max-w-[64px] truncate sm:max-w-none">{signedInAs.name.split(" ")[0]}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-ink-faint transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          {/* click-away layer */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-52 border border-ink/15 bg-paper py-1.5 shadow-[3px_3px_0_rgba(26,24,21,0.08)]"
          >
            {items.map((item) => (
              <Link
                key={item.label}
                role="menuitem"
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-[13px] text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <div className="my-1.5 border-t border-ink/10" />
            <form action={signOutAction}>
              <button
                type="submit"
                role="menuitem"
                className="block w-full px-4 py-2 text-left text-[13px] text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
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
      <span className="hidden font-serif-display text-lg tracking-tight text-ink min-[430px]:inline">
        Disruptajob
      </span>
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
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex items-center border border-ink/15 p-0.5 text-[13px] font-medium">
        <Link
          href={talentHome}
          className={cn(
            "px-2.5 py-1.5 transition-colors sm:px-3.5",
            !isEmployer ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
          )}
        >
          Looking
        </Link>
        <Link
          href={EMPLOYER_HOME}
          className={cn(
            "px-2.5 py-1.5 transition-colors sm:px-3.5",
            isEmployer ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
          )}
        >
          Hiring
        </Link>
      </div>

      {/* Who you are is now a real thing that can be wrong, so it's always on screen. */}
      {signedInAs ? (
        <AccountMenu signedInAs={signedInAs} talentHome={talentHome} />
      ) : (
        <Link href="/signin" className="hidden text-[13px] text-ink-soft underline-grow sm:inline">
          Sign in
        </Link>
      )}
    </div>
  );
}
