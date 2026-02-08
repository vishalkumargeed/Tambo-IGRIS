"use client";

import { setReadyForReview, type ReadyForReviewValue } from "@/lib/pr-ready-for-review";
import * as React from "react";

const VALID_VALUES: ReadyForReviewValue[] = ["Ready", "In Process", "Done", "Not Ready"];

function normalizeValue(v: string): ReadyForReviewValue {
  const s = (v ?? "").trim();
  if (/^ready$/i.test(s)) return "Ready";
  if (/^in\s*process$/i.test(s)) return "In Process";
  if (/^done$/i.test(s)) return "Done";
  if (/^not\s*ready$/i.test(s)) return "Not Ready";
  return VALID_VALUES.includes(v as ReadyForReviewValue) ? (v as ReadyForReviewValue) : "Not Ready";
}

export interface PRReviewStateSyncProps {
  owner: string;
  repo: string;
  prNumber: number;
  value?: string;
}

/**
 * Tambo component: when the AI renders this after reviewing a PR, it updates the
 * review state in localStorage so the dashboard Pull Requests table shows the
 * correct "Review" column (Ready / In Process / Done / Not Ready).
 */
export function PRReviewStateSync({
  owner,
  repo,
  prNumber,
  value = "Not Ready",
}: PRReviewStateSyncProps) {
  React.useEffect(() => {
    if (owner && repo && prNumber) {
      setReadyForReview(owner, repo, prNumber, normalizeValue(value));
    }
  }, [owner, repo, prNumber, value]);

  return null;
}
