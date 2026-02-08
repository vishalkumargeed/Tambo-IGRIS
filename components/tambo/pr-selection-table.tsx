"use client";

import { useTamboThreadInput } from "@tambo-ai/react";
import { ExternalLink, Loader2 } from "lucide-react";
import * as React from "react";

export interface PRListItem {
  number: number;
  title: string;
  url?: string;
}

export interface PRListData {
  owner: string;
  repo: string;
  prs: PRListItem[];
}

function parsePRListJson(content: string): PRListData | null {
  try {
    const raw = JSON.parse(content) as unknown;
    if (
      !raw ||
      typeof raw !== "object" ||
      !("owner" in raw) ||
      !("repo" in raw) ||
      !("prs" in raw) ||
      !Array.isArray((raw as { prs: unknown }).prs)
    ) {
      return null;
    }
    const { owner, repo, prs } = raw as {
      owner: string;
      repo: string;
      prs: unknown[];
    };
    const list = prs
      .map((p): PRListItem | null => {
        if (p && typeof p === "object" && "number" in p && "title" in p) {
          const num = Number((p as { number: number }).number);
          const title = String((p as { title: string }).title);
          const url =
            "url" in p && typeof (p as { url: string }).url === "string"
              ? (p as { url: string }).url
              : undefined;
          return { number: num, title, url };
        }
        return null;
      })
      .filter((x): x is PRListItem => x !== null);
    if (list.length === 0) return null;
    return {
      owner: String(owner),
      repo: String(repo),
      prs: list,
    };
  } catch {
    return null;
  }
}

export type PRListState = "open" | "closed";

interface PRSelectionTableProps {
  owner: string;
  repo: string;
  prs: PRListItem[];
  /** When the list is open PRs use "open" (shows Close selected); when closed PRs use "closed" (shows Open selected). Default "open". */
  state?: PRListState;
}

/**
 * Interactive table: select PRs (todo) and trigger "Review selected PRs" which
 * sends a message to Tambo so the GitHub MCP reviews them one by one.
 */
export function PRSelectionTableInner({
  owner,
  repo,
  prs,
  state = "open",
}: PRSelectionTableProps) {
  const { setValue, submit } = useTamboThreadInput();
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmittingAlt, setIsSubmittingAlt] = React.useState(false);
  const [isSubmittingMerge, setIsSubmittingMerge] = React.useState(false);

  const toggle = (num: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(prs.map((p) => p.number)));
  const deselectAll = () => setSelected(new Set());

  const handleReviewSelected = React.useCallback(() => {
    if (selected.size === 0 || isSubmitting) return;
    const numbers = Array.from(selected).sort((a, b) => a - b);
    const prList = numbers.map((n) => `#${n}`).join(", ");
    const message = `Please review the following PRs one by one using the GitHub MCP (owner: ${owner}, repo: ${repo}): ${prList}. Apply the full review protocol to each PR. Make sure to adhere the Multiple PRs Review Protocol and the Multi-step Review Protocol`;
    setValue(message);
    setIsSubmitting(true);
    // Allow React to commit the value update before submit reads it
    const t = setTimeout(() => {
      submit({
        streamResponse: true,
        resourceNames: {},
      })
        .catch(() => {
          setIsSubmitting(false);
        })
        .then(() => {
          setIsSubmitting(false);
        });
    }, 80);
    return () => clearTimeout(t);
  }, [owner, repo, selected, submit, setValue, isSubmitting]);

  const handleCloseOrOpenSelected = React.useCallback(() => {
    if (selected.size === 0 || isSubmittingAlt) return;
    const numbers = Array.from(selected).sort((a, b) => a - b);
    const prList = numbers.map((n) => `#${n}`).join(", ");
    const message =
      state === "open"
        ? `Please close the following PRs using the GitHub MCP (owner: ${owner}, repo: ${repo}): ${prList}. Use update_pull_request with state 'closed' for each PR.`
        : `Please reopen the following PRs using the GitHub MCP (owner: ${owner}, repo: ${repo}): ${prList}. Use update_pull_request with state 'open' for each PR.`;
    setValue(message);
    setIsSubmittingAlt(true);
    const t = setTimeout(() => {
      submit({ streamResponse: true, resourceNames: {} })
        .catch(() => setIsSubmittingAlt(false))
        .then(() => setIsSubmittingAlt(false));
    }, 80);
    return () => clearTimeout(t);
  }, [owner, repo, state, selected, submit, setValue, isSubmittingAlt]);

  const handleMergeSelected = React.useCallback(() => {
    if (selected.size === 0 || isSubmittingMerge) return;
    const numbers = Array.from(selected).sort((a, b) => a - b);
    const prList = numbers.map((n) => `#${n}`).join(", ");
    const message = `Please merge the following open PRs. For each PR, render MergePRCard so the user can enter a commit message and merge (owner: ${owner}, repo: ${repo}): ${prList}.`;
    setValue(message);
    setIsSubmittingMerge(true);
    const t = setTimeout(() => {
      submit({ streamResponse: true, resourceNames: {} })
        .catch(() => setIsSubmittingMerge(false))
        .then(() => setIsSubmittingMerge(false));
    }, 80);
    return () => clearTimeout(t);
  }, [owner, repo, selected, submit, setValue, isSubmittingMerge]);

  const actionLabel = state === "open" ? "Close selected" : "Open selected";

  return (
    <div className="my-4 w-full max-w-3xl rounded-lg border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <span className="text-sm font-medium text-foreground">
          {state === "open" ? "Select PRs to review or close" : "Select PRs to review or reopen"}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
          >
            Deselect all
          </button>
          <button
            type="button"
            onClick={handleReviewSelected}
            disabled={selected.size === 0 || isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sending…
              </>
            ) : (
              `Review selected (${selected.size})`
            )}
          </button>
          {state === "open" && (
            <button
              type="button"
              onClick={handleMergeSelected}
              disabled={selected.size === 0 || isSubmittingMerge}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              {isSubmittingMerge ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending…
                </>
              ) : (
                `Merge selected (${selected.size})`
              )}
            </button>
          )}
          <button
            type="button"
            onClick={handleCloseOrOpenSelected}
            disabled={selected.size === 0 || isSubmittingAlt}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            {isSubmittingAlt ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sending…
              </>
            ) : (
              `${actionLabel} (${selected.size})`
            )}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-10 border-r border-border px-3 py-2 text-left font-semibold text-foreground">
                Select
              </th>
              <th className="w-20 border-r border-border px-3 py-2 text-left font-semibold text-foreground">
                PR #
              </th>
              <th className="border-border px-3 py-2 text-left font-semibold text-foreground">
                Title
              </th>
              <th className="w-16 border-l border-border px-2 py-2 text-center font-semibold text-foreground">
                Link
              </th>
            </tr>
          </thead>
          <tbody>
            {prs.map((pr) => (
              <tr
                key={pr.number}
                className="border-b border-border last:border-b-0 hover:bg-muted/30"
              >
                <td className="border-r border-border px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(pr.number)}
                    onChange={() => toggle(pr.number)}
                    aria-label={`Select PR #${pr.number}`}
                    className="h-4 w-4 rounded border-border"
                  />
                </td>
                <td className="border-r border-border px-3 py-2 font-medium text-foreground">
                  #{pr.number}
                </td>
                <td className="border-border px-3 py-2 text-foreground">
                  {pr.title}
                </td>
                <td className="border-l border-border px-2 py-2 text-center">
                  {pr.url ? (
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-muted-foreground hover:text-foreground"
                      aria-label={`Open PR #${pr.number}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Tambo component: Renders the interactive PR selection table when the AI or MCP
 * returns a list of PRs (e.g. "template PR" list). Register in lib/tambo.ts so
 * the model can render this with owner, repo, prs and the table appears in the message.
 */
function normalizePRState(s: unknown): PRListState {
  const v = typeof s === "string" ? s.trim().toLowerCase() : "";
  return v === "closed" ? "closed" : "open";
}

export function PRListTable({
  owner,
  repo,
  prs,
  state = "open",
}: {
  owner: string;
  repo: string;
  prs: Array<{ number: number; title: string; url?: string }>;
  /** "open" for open PRs (shows Close selected), "closed" for closed PRs (shows Open selected). */
  state?: unknown;
}) {
  const prState = normalizePRState(state);
  const normalized: PRListItem[] = React.useMemo(
    () =>
      (prs ?? []).map((p) => ({
        number: Number(p.number),
        title: String(p.title ?? ""),
        url:
          p.url != null && p.url !== ""
            ? String(p.url)
            : undefined,
      })),
    [prs],
  );
  if (normalized.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        No PRs to show.
      </div>
    );
  }
  return (
    <PRSelectionTableInner
      owner={String(owner ?? "")}
      repo={String(repo ?? "")}
      prs={normalized}
      state={prState}
    />
  );
}

/**
 * Renders interactive PR selection table when content is valid pr-list JSON.
 * Used from markdown code block (language: pr-list).
 */
export function PRListCodeBlock({ content }: { content: string }) {
  const data = React.useMemo(
    () => parsePRListJson(content.trim()),
    [content],
  );
  if (!data) {
    return (
      <div className="my-4 rounded-md border border-border bg-muted p-3 font-mono text-sm text-muted-foreground">
        Invalid pr-list JSON
      </div>
    );
  }
  return (
    <PRSelectionTableInner
      owner={data.owner}
      repo={data.repo}
      prs={data.prs}
    />
  );
}
