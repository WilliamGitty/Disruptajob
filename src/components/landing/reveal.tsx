"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Scroll-triggered reveal, in the house style.
 *
 * What this is: content rises gently into place as it enters the viewport, and groups (the three
 * reality cards, the six work cards in the hero drawing) arrive in sequence — so the illustrations
 * assemble their argument in front of you. What this deliberately isn't: parallax, scroll-jacking,
 * or anything that takes the scrollbar away from the reader. Restraint is the house style, and a
 * page for someone eleven months into a job search should never feel like it's performing at them.
 *
 * Mechanics, and why they look the way they do:
 *
 *  - No React state. The observer flips a data attribute and CSS does the rest, so revealing a
 *    section costs no re-render — and there's no setState-in-an-effect, which this codebase has
 *    been bitten by twice.
 *  - useLayoutEffect hides elements BEFORE first paint, so nothing flashes visible-then-hidden.
 *    If JavaScript never runs, the attribute is never set and everything is simply visible —
 *    progressive enhancement means the no-JS page is the complete page.
 *  - prefers-reduced-motion is checked in JS (nothing is ever hidden) and enforced again in CSS.
 */
export function Reveal({
  children,
  className,
  /** CSS selector for children to stagger. `true` means direct children. */
  stagger,
  /** Extra delay in ms before this block reveals — lets a pair arrive as a sequence. */
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean | string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.style.setProperty("--reveal-delay", `${delay}ms`);

    /*
     * The one rule that outranks the animation: nothing may ever be left invisible. So the
     * observer is constructed BEFORE anything is hidden — if that throws for any reason, we bail
     * out with the content exactly as it was. Hiding first and observing second is how a page
     * ends up blank for the one browser you didn't test.
     */
    let observer: IntersectionObserver;
    const deadline: { id?: number } = {};
    const show = () => {
      el.setAttribute("data-reveal", "in");
      observer.disconnect();
      if (deadline.id !== undefined) window.clearTimeout(deadline.id);
    };

    try {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) show();
          }
        },
        // Fire a little before the element's top edge, so the motion is underway as it arrives.
        { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
      );
      observer.observe(el);
    } catch {
      return;
    }

    if (stagger) {
      const selector = typeof stagger === "string" ? stagger : ":scope > *";
      el.setAttribute("data-reveal-stagger", "");
      el.querySelectorAll(selector).forEach((child, i) => {
        child.setAttribute("data-ri", "");
        (child as HTMLElement).style?.setProperty?.("--ri", String(i));
      });
    }

    // Hidden only now — after the observer that will unhide it provably exists.
    el.setAttribute("data-reveal", "pending");

    // Fail OPEN on a deadline. In webviews (a profile link opened inside LinkedIn or a chat
    // app), prerendered tabs, and screenshotting crawlers, IntersectionObserver can fire late
    // or never — which turned the grey employer band into thousands of pixels of empty grey in
    // an external audit. Motion is a nicety; content is the contract. Three seconds without an
    // intersection and everything simply appears.
    deadline.id = window.setTimeout(show, 3000);

    // A page restored from the back-forward cache, or opened pre-rendered in a background tab,
    // can reach the user with stale intersection state. One cheap nudge covers both.
    const onShow = () => {
      if (document.hidden) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0 && rect.height > 0) show();
    };
    window.addEventListener("pageshow", onShow);
    document.addEventListener("visibilitychange", onShow);

    return () => {
      observer.disconnect();
      if (deadline.id !== undefined) window.clearTimeout(deadline.id);
      window.removeEventListener("pageshow", onShow);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [stagger, delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
