"use client";

import { useEffect, useRef } from "react";
import { recordSearch } from "@/server/actions/hiring";

/**
 * Records the current search against the signed-in company.
 *
 * Fire-and-forget: the action is a no-op for anyone signed out, and failing to log a search
 * should never interrupt looking at results.
 */
export function RecordSearch({ query }: { query: string }) {
  const recorded = useRef<string | null>(null);

  useEffect(() => {
    if (!query.trim() || recorded.current === query) return;
    recorded.current = query;
    void recordSearch(query);
  }, [query]);

  return null;
}
