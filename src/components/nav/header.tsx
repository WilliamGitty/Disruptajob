"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/server/actions/auth";

const EMPLOYER_HOME = "/employer";

const EMPLOYER_LINKS = [
  { label: "Find people", href: EMPLOYER_HOME },
  { label: "Your role", href: "/employer/setup" },
  { label: "Pipeline", href: "/employer/pipeline" },
  { label: "Saved", href: "/employer/saved" },
  { label: "Conversations", href: "/employer/responses" },
  { label: "Account", href: "/employer/settings" },
];

interface MenuItem {
  label: string;
  href: string;
  /** Carries the awaiting count, for the one item that can have things waiting. */
  badge?: number;
}

/**
 * The condensed header, to the founder's sketch (19 Oct 2026). One design everywhere:
 *
 * Signed out:            About ▾ · I'm hiring · Sign in · [Create an account]
 * Signed-in candidate:   About ▾ · [first name] ▾ · Settings ▾
 *
 * The old row of loose links grew by accretion; this one is three doors, each a short menu.
 * Employer accounts keep the previous app header untouched, deliberately: that side stays
 * underbuilt until real candidates justify building it.
 */
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
  // One dropdown open at a time, remembered with the route it opened on, so navigating
  // away closes it by derivation rather than by syncing state in an effect.
  const [openState, setOpenState] = useState<{ id: string; at: string } | null>(null);
  const openId = openState && openState.at === pathname ? openState.id : null;
  const toggle = (id: string) =>
    setOpenState(openId === id ? null : { id, at: pathname ?? "" });
  const close = () => setOpenState(null);

  if (signedInAs?.role === "employer") {
    return <EmployerHeader awaiting={awaiting} signedInAs={signedInAs} talentHome={talentHome} />;
  }

  const aboutItems: MenuItem[] = [
    { label: "About us", href: "/about" },
    // The question a first-time visitor is actually asking. Signed-in people answered it.
    ...(signedInAs ? [] : [{ label: "Why create an account?", href: "/why" }]),
    { label: "Articles", href: "/articles" },
    { label: "Guides", href: "/guides" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
        <Logo />
        <nav className="flex items-center gap-4 sm:gap-5">
          {/* Left-aligned: About is the leftmost door, and a right-aligned menu under it
              hangs off the left edge of a phone screen. The founder saw it happen. */}
          <NavDropdown
            id="about"
            label="About"
            align="left"
            items={aboutItems}
            openId={openId}
            onToggle={toggle}
            onNavigate={close}
          />

          {signedInAs ? (
            <>
              <NavDropdown
                id="me"
                label={signedInAs.name.split(" ")[0]}
                bordered
                buttonBadge={awaiting}
                items={[
                  { label: "My profile settings", href: "/talent/account" },
                  { label: "My projects", href: talentHome },
                  { label: "Job roles available", href: "/talent/matches" },
                  { label: "Registered interest", href: "/talent/interested" },
                  { label: "Who's interested", href: "/talent/opportunities", badge: awaiting },
                ]}
                openId={openId}
                onToggle={toggle}
                onNavigate={close}
                footer={
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      role="menuitem"
                      className="block w-full px-4 py-2 text-left text-[13px] text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink"
                    >
                      Sign out
                    </button>
                  </form>
                }
              />
              <NavDropdown
                id="settings"
                label="Settings"
                items={[
                  { label: "Account management", href: "/talent/settings" },
                  { label: "Help", href: "/faq" },
                  { label: "Terms and conditions", href: "/terms" },
                ]}
                openId={openId}
                onToggle={toggle}
                onNavigate={close}
              />
            </>
          ) : (
            <>
              <Link
                href={EMPLOYER_HOME}
                className="hidden whitespace-nowrap text-sm text-ink-soft underline-grow sm:inline"
              >
                I&rsquo;m hiring
              </Link>
              <Link href="/signin" className="whitespace-nowrap text-sm text-ink-soft underline-grow">
                Sign in
              </Link>
              <Link href="/talent/onboarding" className="shrink-0">
                <span className="inline-flex h-9 items-center whitespace-nowrap border border-ink/20 px-3.5 text-sm font-medium text-ink transition-colors hover:border-ink sm:h-10 sm:px-5">
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

/**
 * One labelled door that opens a short menu. Click-away closes it; so does navigating,
 * because the open state remembers which route it was opened on.
 */
function NavDropdown({
  id,
  label,
  items,
  openId,
  onToggle,
  onNavigate,
  bordered = false,
  buttonBadge = 0,
  align = "right",
  footer,
}: {
  id: string;
  label: string;
  items: MenuItem[];
  openId: string | null;
  onToggle: (id: string) => void;
  onNavigate: () => void;
  bordered?: boolean;
  buttonBadge?: number;
  align?: "left" | "right";
  footer?: ReactNode;
}) {
  const open = openId === id;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-1.5 text-[13px] font-medium transition-colors",
          bordered
            ? "border border-ink/15 px-2.5 py-1.5 text-ink hover:border-ink/40 sm:px-3"
            : "py-1.5 text-ink-soft hover:text-ink"
        )}
      >
        <span className={bordered ? "max-w-[72px] truncate sm:max-w-none" : undefined}>
          {label}
        </span>
        {buttonBadge > 0 && <CountDot count={buttonBadge} />}
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-ink-faint transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <>
          {/* click-away layer */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => onToggle(id)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className={cn(
              "absolute top-full z-50 mt-2 w-56 border border-ink/15 bg-paper py-1.5 shadow-[3px_3px_0_rgba(26,24,21,0.08)]",
              align === "left" ? "left-0" : "right-0"
            )}
          >
            {items.map((item) => (
              <Link
                key={item.label}
                role="menuitem"
                href={item.href}
                onClick={onNavigate}
                className="flex items-center gap-2 px-4 py-2 text-[13px] text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink"
              >
                {item.label}
                {(item.badge ?? 0) > 0 && <CountDot count={item.badge ?? 0} />}
              </Link>
            ))}
            {footer && (
              <>
                <div className="my-1.5 border-t border-ink/10" />
                {footer}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The employer app header, unchanged from before the candidate header was condensed.
 * It keeps the Looking/Hiring toggle because an employer account is the one place both
 * modes are real.
 */
function EmployerHeader({
  awaiting,
  signedInAs,
  talentHome,
}: {
  awaiting: number;
  signedInAs: { name: string; role: "talent" | "employer" };
  talentHome: string;
}) {
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const menuOpen = openedAt !== null && openedAt === pathname;
  const setMenuOpen = (next: boolean) => setOpenedAt(next ? pathname : null);
  const badgedHref = "/employer/responses";

  const renderLinks = (textSize: string) =>
    EMPLOYER_LINKS.map((link) => {
      const active =
        pathname === link.href || (pathname?.startsWith(link.href) && link.href !== EMPLOYER_HOME);
      return (
        <Link
          key={link.label}
          href={link.href}
          className={cn(
            "inline-flex items-center gap-2 font-medium tracking-wide transition-colors",
            textSize,
            active ? "text-ink" : "text-ink-faint hover:text-ink"
          )}
        >
          {link.label}
          {link.href === badgedHref && awaiting > 0 && <CountDot count={awaiting} />}
        </Link>
      );
    });

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-6 lg:px-10">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">{renderLinks("text-[13px]")}</nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-ink/15 p-0.5 text-[13px] font-medium">
            <Link href={talentHome} className="px-2.5 py-1.5 text-ink-soft transition-colors hover:text-ink sm:px-3.5">
              Looking
            </Link>
            <Link href={EMPLOYER_HOME} className="bg-ink px-2.5 py-1.5 text-paper sm:px-3.5">
              Hiring
            </Link>
          </div>
          <EmployerAccountMenu signedInAs={signedInAs} />
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
          <div className="flex flex-col gap-4">{renderLinks("text-sm")}</div>
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

function EmployerAccountMenu({ signedInAs }: { signedInAs: { name: string } }) {
  const [open, setOpen] = useState(false);
  const items = [
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
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-sm"
      />
      <span className="hidden font-serif-display text-lg tracking-tight text-ink min-[560px]:inline">
        Disruptajob
      </span>
    </Link>
  );
}
