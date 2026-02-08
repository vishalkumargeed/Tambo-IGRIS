/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * Read more about Tambo at https://docs.tambo.co
 */

import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { ContinueReviewCard } from "@/components/tambo/continue-review-card";
import { DashboardCustomizer } from "@/components/tambo/dashboard-customizer";
import { PRListTable } from "@/components/tambo/pr-selection-table";
import { PRReviewStateSync } from "@/components/tambo/pr-review-state-sync";

const prListItemSchema = z.object({
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
      "Show an interactive table of pull requests when you have a list of PRs to display (e.g. after listing or searching PRs, or when the user asks for 'template PR' or 'PRs with Template in title'). Always render this component with the owner, repo, and prs array so the user sees a table with checkboxes and a 'Review selected' option. Do not only output the list as text or JSON—render PRListTable so the response includes the table. Each item in prs must have number (PR number), title (string), and optionally url (HTML URL of the PR).",
    component: PRListTable,
    propsSchema: z.object({
      owner: z.string().optional().default(""),
      repo: z.string().optional().default(""),
      prs: z.array(prListItemSchema).optional().default([]),
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
];
