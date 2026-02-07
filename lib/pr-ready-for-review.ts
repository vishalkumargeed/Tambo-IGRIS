/**
 * Ready for Review state for PRs. Values can be updated by Tambo during conversation.
 * Use setReadyForReview() when Tambo marks a PR as Ready, In Process, etc.
 */

export type ReadyForReviewValue = "Ready" | "In Process" | "Done" | "Not Ready"

const STORAGE_KEY = "pr-ready-for-review"

export function getReadyForReviewOverride(
  owner: string,
  repoName: string,
  prNumber: number
): ReadyForReviewValue | null {
  if (typeof window === "undefined") return null
  try {
    const key = `${STORAGE_KEY}:${owner}/${repoName}:${prNumber}`
    const v = localStorage.getItem(key)
    if (v === "Ready" || v === "In Process" || v === "Done" || v === "Not Ready") return v
  } catch {
    /* ignore */
  }
  return null
}

/** Call this when Tambo updates a PR's Ready for Review status during conversation */
export function setReadyForReview(
  owner: string,
  repoName: string,
  prNumber: number,
  value: ReadyForReviewValue
) {
  if (typeof window === "undefined") return
  try {
    const key = `${STORAGE_KEY}:${owner}/${repoName}:${prNumber}`
    localStorage.setItem(key, value)
    window.dispatchEvent(new CustomEvent("pr-ready-for-review-updated", { detail: { key } }))
  } catch {
    /* ignore */
  }
}
