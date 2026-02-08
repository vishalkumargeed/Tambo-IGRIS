"use client";

import { useTamboThreadInput } from "@tambo-ai/react";
import { ExternalLink, Loader2 } from "lucide-react";
import * as React from "react";

export interface IssueListItem {
  number: number;
  title: string;
  url?: string;
}

export type IssueListState = "open" | "closed";

interface IssueSelectionTableProps {
  owner: string;
  repo: string;
  issues: IssueListItem[];
  /** "open" for open issues (shows Close selected), "closed" for closed issues (shows Open selected). */
  state?: IssueListState;
}

/**
 * Interactive table: select issues and trigger Close selected (for open list) or
 * Open selected (for closed list). Sends a message to Tambo so the GitHub MCP
 * closes or reopens the selected issues.
 */
export function IssueSelectionTableInner({
  owner,
  repo,
  issues,
  state = "open",
}: IssueSelectionTableProps) {
  const { setValue, submit } = useTamboThreadInput();
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const toggle = (num: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(issues.map((i) => i.number)));
  const deselectAll = () => setSelected(new Set());

  const handleCloseOrOpenSelected = React.useCallback(() => {
    if (selected.size === 0 || isSubmitting) return;
    const numbers = Array.from(selected).sort((a, b) => a - b);
    const issueList = numbers.map((n) => `#${n}`).join(", ");
    const message =
      state === "open"
        ? `Please close the following issues using the GitHub MCP (owner: ${owner}, repo: ${repo}): ${issueList}. Use issue_write with method 'update', state 'closed', and state_reason (e.g. 'completed') for each issue.`
        : `Please reopen the following issues using the GitHub MCP (owner: ${owner}, repo: ${repo}): ${issueList}. Use issue_write with method 'update' and state 'open' for each issue.`;
    setValue(message);
    setIsSubmitting(true);
    const t = setTimeout(() => {
      submit({ streamResponse: true, resourceNames: {} })
        .catch(() => setIsSubmitting(false))
        .then(() => setIsSubmitting(false));
    }, 80);
    return () => clearTimeout(t);
  }, [owner, repo, state, selected, submit, setValue, isSubmitting]);

  const actionLabel = state === "open" ? "Close selected" : "Open selected";

  return (
    <div className="my-4 w-full max-w-3xl rounded-lg border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <span className="text-sm font-medium text-foreground">
          {state === "open"
            ? "Select issues to close"
            : "Select issues to reopen"}
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
            onClick={handleCloseOrOpenSelected}
            disabled={selected.size === 0 || isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
          >
            {isSubmitting ? (
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
                #
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
            {issues.map((issue) => (
              <tr
                key={issue.number}
                className="border-b border-border last:border-b-0 hover:bg-muted/30"
              >
                <td className="border-r border-border px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(issue.number)}
                    onChange={() => toggle(issue.number)}
                    aria-label={`Select issue #${issue.number}`}
                    className="h-4 w-4 rounded border-border"
                  />
                </td>
                <td className="border-r border-border px-3 py-2 font-medium text-foreground">
                  #{issue.number}
                </td>
                <td className="border-border px-3 py-2 text-foreground">
                  {issue.title}
                </td>
                <td className="border-l border-border px-2 py-2 text-center">
                  {issue.url ? (
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-muted-foreground hover:text-foreground"
                      aria-label={`Open issue #${issue.number}`}
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

function normalizeIssueState(s: unknown): IssueListState {
  const v = typeof s === "string" ? s.trim().toLowerCase() : "";
  return v === "closed" ? "closed" : "open";
}

/**
 * Tambo component: Renders the interactive Issue selection table when the AI
 * returns a list of issues. Pass state "open" or "closed" so the button shows
 * Close selected or Open selected accordingly.
 */
export function IssueListTable({
  owner,
  repo,
  issues,
  state = "open",
}: {
  owner: string;
  repo: string;
  issues: Array<{ number: number; title: string; url?: string }>;
  state?: unknown;
}) {
  const issueState = normalizeIssueState(state);
  const normalized: IssueListItem[] = React.useMemo(
    () =>
      (issues ?? []).map((i) => ({
        number: Number(i.number),
        title: String(i.title ?? ""),
        url:
          i.url != null && i.url !== "" ? String(i.url) : undefined,
      })),
    [issues],
  );
  if (normalized.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        No issues to show.
      </div>
    );
  }
  return (
    <IssueSelectionTableInner
      owner={String(owner ?? "")}
      repo={String(repo ?? "")}
      issues={normalized}
      state={issueState}
    />
  );
}
