import type { MetadataRoute } from "next";

// Rendered per request, not baked at build: CI builds without production env (and with an
// in-memory database), so a static version would freeze the wrong answer into the image.
export const dynamic = "force-dynamic";

/**
 * Keep the preview out of search results.
 *
 * Profiles here contain real employment history and people who have explicitly chosen to be
 * hidden from employers. Having any of that surface in a Google result would break the product's
 * central promise far more thoroughly than a bug would.
 *
 * Flip ALLOW_INDEXING to "true" only once there's a privacy policy and the content is genuinely
 * meant to be public.
 */
export default function robots(): MetadataRoute.Robots {
  const allow = process.env.ALLOW_INDEXING === "true";

  return allow
    ? { rules: { userAgent: "*", allow: "/", disallow: ["/talent/", "/employer/", "/signin", "/signup"] } }
    : { rules: { userAgent: "*", disallow: "/" } };
}
