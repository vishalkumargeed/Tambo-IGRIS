/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * Read more about Tambo at https://docs.tambo.co
 */

import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { ContinueReviewCard } from "@/components/tambo/continue-review-card";
import { CreateIssueCard } from "@/components/tambo/create-issue-card";
import { CreateRepoCard } from "@/components/tambo/create-repo-card";
import { DashboardCustomizer } from "@/components/tambo/dashboard-customizer";
import { IssueListTable } from "@/components/tambo/issue-selection-table";
import { MergePRCard } from "@/components/tambo/merge-pr-card";
import { PRListTable } from "@/components/tambo/pr-selection-table";
import { PRReviewStateSync } from "@/components/tambo/pr-review-state-sync";

const prListItemSchema = z.object({
  number: z.coerce.number().optional().default(0),
  title: z.string().optional().default(""),
  url: z.string().optional(),
});

const issueListItemSchema = z.object({
  number: z.coerce.number().optional().default(0),
  title: z.string().optional().default(""),
  url: z.string().optional(),
});

/**
 * Components Array - AI can render these when the user asks.
 * DashboardCustomizer lets users customize the dashboard look via natural language.
 * PRListTable shows an interactive table when listing/filtering PRs (e.g. template PRs).
 */
export const components: TamboComponent[] = [
  {
    name: "DashboardCustomizer",
    description:
      "Customize the dashboard look. Use when the user asks to change dashboard appearance: theme (light/dark), show/hide sections (cards, chart, table), card layout (grid/compact/minimal), sidebar width (narrow/default/wide), accent color, or card style (default/bordered/flat). Pass reset: true to restore defaults.",
    component: DashboardCustomizer,
    propsSchema: z.object({
      theme: z.enum(["light", "dark", "system"]).optional(),
      cardLayout: z.enum(["grid", "compact", "minimal"]).optional(),
      showSectionCards: z.boolean().optional(),
      showChart: z.boolean().optional(),
      showDataTable: z.boolean().optional(),
      sidebarWidth: z.enum(["narrow", "default", "wide"]).optional(),
      accentColor: z.string().optional(),
      cardStyle: z.enum(["default", "bordered", "flat"]).optional(),
      reset: z.boolean().optional(),
    }),
  },
  {
    name: "PRListTable",
    description:
      "Show an interactive table of pull requests when you have a list of PRs to display. Pass state: 'open' when the list is open PRs (table shows 'Review selected', 'Merge selected', and 'Close selected'), or state: 'closed' when the list is closed PRs (table shows 'Review selected' and 'Open selected'). Always render with owner, repo, prs, and the correct state so the user sees the right actions. Each item in prs must have number, title, and optionally url. When the user clicks Merge selected, you will receive a follow-up; render MergePRCard for each listed PR so they can enter a commit message and merge.",
    component: PRListTable,
    propsSchema: z.object({
      owner: z.string().optional().default(""),
      repo: z.string().optional().default(""),
      prs: z.array(prListItemSchema).optional().default([]),
      state: z.string().optional().default("open"),
    }),
  },
  {
    name: "IssueListTable",
    description:
      "Show an interactive table of issues when you have a list of issues to display. Pass state: 'open' when the list is open issues (table shows 'Close selected'), or state: 'closed' when the list is closed issues (table shows 'Open selected'). Always render with owner, repo, issues array, and the correct state. Each item in issues must have number, title, and optionally url.",
    component: IssueListTable,
    propsSchema: z.object({
      owner: z.string().optional().default(""),
      repo: z.string().optional().default(""),
      issues: z.array(issueListItemSchema).optional().default([]),
      state: z.string().optional().default("open"),
    }),
  },
  {
    name: "ContinueReviewCard",
    description:
      "Render ONLY when you have just finished reviewing one PR and more PRs remain in the list, but the platform ended the stream (Chain-of-Thought Termination). This shows the user a Continue/Cancel card. Do NOT render for general conversation, greetings, single-PR reviews, or when the user did not ask for multi-PR review. Do NOT render after answering 'hi', 'what can you do', or any non-GitHub question.",
    component: ContinueReviewCard,
    propsSchema: z.object({}),
  },
  {
    name: "PRReviewStateSync",
    description:
      "After reviewing each PR you MUST render this component so the dashboard Pull Requests table shows the correct Review status. Pass owner (GitHub owner), repo (repository name), prNumber (PR number), and value: 'Ready' if all criteria were met, otherwise 'In Process'. Use 'Done' for merged PRs, 'Not Ready' for closed without merge. Render once per PR immediately after completing that PR's review and Review State Sync.",
    component: PRReviewStateSync,
    propsSchema: z.object({
      owner: z.string().optional().default(""),
      repo: z.string().optional().default(""),
      prNumber: z.coerce.number().optional().default(0),
      value: z.string().optional().default("Not Ready"),
    }),
  },
  {
    name: "MergePRCard",
    description:
      "Render when the user says they want to merge a particular PR. Shows a card with an input for the merge commit message. Pass owner (GitHub owner), repo (repository name), prNumber (PR number), and optionally prTitle (PR title for display). The user fills the commit message and clicks Merge; then you perform the merge via GitHub MCP using that commit message.",
    component: MergePRCard,
    propsSchema: z.object({
      owner: z.string().optional().default(""),
      repo: z.string().optional().default(""),
      prNumber: z.coerce.number().optional().default(0),
      prTitle: z.string().optional(),
    }),
  },
  {
    name: "CreateIssueCard",
    description:
      "Render when the user asks to create a new issue (e.g. 'create an issue', 'I want to create an issue'). Shows a card with Title (required) and Description (optional) inputs. Pass owner (GitHub owner) and repo (repository name); optionally repoFullName for display (e.g. 'owner/repo'). When the user fills the form and clicks Create issue, you will receive a follow-up with the title and body—use the GitHub MCP (e.g. issue_write or create issue) to create the issue in that repository.",
    component: CreateIssueCard,
    propsSchema: z.object({
      owner: z.string().optional().default(""),
      repo: z.string().optional().default(""),
      repoFullName: z.string().optional(),
    }),
  },
  {
    name: "CreateRepoCard",
    description:
      "Render when the user asks to create a new GitHub repository (e.g. 'create a new repo', 'I want to create a repository'). Shows a card with Repository name (required), Description (optional), Visibility (public/private), Organization (optional—if provided the repo is created under that org, otherwise under the authenticated user), and 'Initialize with README' (optional). Pass organization only if the user specified an org (e.g. 'create a repo in org X'). When the user submits the card, you will receive a follow-up with name, description, visibility, org (if any), and init README—use the GitHub MCP to create the repository (e.g. create_repository or the equivalent tool).",
    component: CreateRepoCard,
    propsSchema: z.object({
      organization: z.string().optional(),
    }),
  },
];
