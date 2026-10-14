import { NextResponse, type NextRequest } from "next/server";

/**
 * Site-wide access gate for the private preview.
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
 */

const USER = process.env.SITE_USER ?? "preview";

export function middleware(request: NextRequest) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return NextResponse.next();

  const header = request.headers.get("authorization");

  if (header?.startsWith("Basic ")) {
    // atob is available in the Edge runtime; Buffer is not.
    const [user, password] = atob(header.slice(6)).split(":");
    if (user === USER && password === expected) return NextResponse.next();
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
