import { getCurrentAccount } from "@/server/auth";
import { collectAccountData } from "@/server/account-data";

/**
 * Download everything we hold about you, as JSON.
 *
 * A route handler rather than a server action because the point is a *file* — something you can
 * keep, read, and take elsewhere. Article 15 says "commonly used, machine-readable"; JSON is both,
 * and needs no library to produce.
 *
 * Not cached, ever: this is personal data keyed to a session cookie.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const account = await getCurrentAccount();
  if (!account) {
    return new Response("Sign in to download your data.", { status: 401 });
  }

  const data = collectAccountData(account);
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="disruptajob-${stamp}.json"`,
      "cache-control": "no-store, private",
    },
  });
}
