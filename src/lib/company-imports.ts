/**
 * Filling in a company name from a web address.
 *
 * This used to be "Connect your website": a button that waited 1.3 seconds to look like it was
 * reading something, then returned invented company descriptions for three hardcoded demo domains.
 * For anyone else it returned a capitalised domain name — which is all it ever actually did.
 *
 * Really reading a company's site is possible later and is not free: fetching a URL a stranger
 * supplies is a server-side request forgery risk that needs real care, and homepage marketing copy
 * is a poor source for anything that matters anyway. So this does the one genuinely useful thing it
 * can do honestly, and says so.
 *
 * The trust boundary is unchanged and is the reason this file is deliberately small:
 * `CompanyContextImport` has no field for work examples, roles or terms. A company's actual work
 * must be written by someone who knows the job — if a scrape could populate it, employers would
 * ship whatever their homepage says and the matching signal would be exactly as worthless as a
 * job description.
 */

/** Context fields only. Deliberately cannot carry `workExamples` — see the note above. */
export interface CompanyContextImport {
  name: string;
}

/** Normalise whatever someone pastes — "https://Foo.com/about" → "foo.com". */
export function normaliseDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

/**
 * A reasonable guess at a company name from its domain. Nothing is fetched.
 *
 * "harbour-freight.co.uk" → "Harbour Freight". The person edits it if we guessed wrong, which is
 * why guessing is acceptable here and would not be for anything that affects matching.
 */
export function companyNameFromDomain(input: string): CompanyContextImport {
  const domain = normaliseDomain(input);
  const bare = domain.split(".")[0] ?? "";

  const name = bare
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return { name };
}
