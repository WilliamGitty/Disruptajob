#!/usr/bin/env node
/**
 * Sitewide link-and-footer crawl against a running dev server.
 *
 *   npm run dev          (in one terminal)
 *   npm run crawl        (in another; exits non-zero on any failure)
 *
 * Checks two things on every reachable page: no internal link 404s, and the footer is present
 * and complete. It caught a broken favicon path, a dead community link, and three pages that
 * lost their footer during a refactor — all before a user did. It lived as a scratchpad script
 * through launch week; it moved into the repo because verification that evaporates with a chat
 * session isn't verification.
 *
 * Zero dependencies on purpose (Node 22 fetch), same rule as the app itself.
 */

const BASE = process.env.CRAWL_BASE ?? "http://localhost:3000";
const FOOTER_MUST_HAVE = ["/about", "/articles", "/faq", "/privacy", "/terms", "/employer"];
const MAX_PAGES = 400;
const SKIP = /^(mailto:|https?:\/\/|#|tel:)/;

const seen = new Set();
const queue = ["/"];
const dead = [];
const noFooter = [];

while (queue.length > 0 && seen.size < MAX_PAGES) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);

  let res, html;
  try {
    res = await fetch(BASE + path, { signal: AbortSignal.timeout(15000) });
    html = await res.text();
  } catch (error) {
    dead.push(`${path} (${String(error).slice(0, 60)})`);
    continue;
  }
  if (!res.ok) {
    dead.push(`${path} (${res.status})`);
    continue;
  }

  const footer = html.match(/<footer[\s\S]*?<\/footer>/);
  if (!footer) {
    noFooter.push(path);
  } else {
    const missing = FOOTER_MUST_HAVE.filter((h) => !footer[0].includes(`href="${h}"`));
    if (missing.length > 0) noFooter.push(`${path} (missing ${missing.join(",")})`);
  }

  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const href = match[1];
    if (SKIP.test(href)) continue;
    const clean = href.split("#")[0].split("?")[0];
    if (!clean.startsWith("/") || clean.startsWith("/_next")) continue;
    if (/\.(png|jpg|jpeg|svg|xml|txt|ico|webmanifest)$/.test(clean)) continue;
    if (!seen.has(clean)) queue.push(clean);
  }
}

console.log(`crawled ${seen.size} pages at ${BASE}`);
console.log("dead links:", dead.length > 0 ? dead : "none");
console.log(
  "pages without complete footer:",
  noFooter.length > 0 ? noFooter.slice(0, 10) : "none"
);

if (dead.length > 0 || noFooter.length > 0) process.exit(1);
