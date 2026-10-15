import { NextResponse, type NextRequest } from "next/server";

/**
 * Site-wide access gate for the private preview, and the one place a visitor id is minted.
 *
 * Until there's a privacy policy, ICO registration and email verification, this must not be open
 * to the public: the demo accounts have no password, so anyone who found the URL could sign in as
 * someone else and read their conversations. HTTP Basic auth over HTTPS is crude but it is a real
 * lock, and it's the right amount of ceremony for "shareable link, not public launch".
 *
 * Set SITE_PASSWORD to enable it. With the variable unset — which is how local development runs —
 * the gate is skipped entirely, so this never gets in your way on localhost.
 *
 * Delete this file the day the site genuinely opens to the public.
 *
 * The visitor cookie is set here because a Server Component can read cookies but not write them —
 * so without this, the first page anyone lands on could never be counted. See server/analytics.ts
 * for what the id is and, more importantly, what it deliberately isn't.
 */

const USER = process.env.SITE_USER ?? "preview";
const VISITOR_COOKIE = "dj_v";
const VISITOR_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

/**
 * Attach a visitor id when the request doesn't carry one.
 *
 * Set on the request as well as the response, because a Server Component reads the cookies that
 * arrived with the request — set it only on the way out and the very first page view, the one
 * that matters most, is the one you never count.
 */
function visitorResponse(request: NextRequest): NextResponse {
  const existing = request.cookies.get(VISITOR_COOKIE)?.value;
  if (existing) return NextResponse.next();

  const id = crypto.randomUUID();
  request.cookies.set(VISITOR_COOKIE, id);

  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: VISITOR_MAX_AGE,
    path: "/",
  });
  return response;
}

export function middleware(request: NextRequest) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return visitorResponse(request);

  const header = request.headers.get("authorization");

  if (header?.startsWith("Basic ")) {
    // atob is available in the Edge runtime; Buffer is not.
    const [user, password] = atob(header.slice(6)).split(":");
    if (user === USER && password === expected) return visitorResponse(request);
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Disruptajob preview", charset="UTF-8"',
      // Belt and braces alongside robots.txt — a 401 shouldn't be indexed either.
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export const config = {
  // Everything except Next's own assets, so the gate can't be walked around via a static path.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
