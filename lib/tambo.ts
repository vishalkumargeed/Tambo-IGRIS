/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * Read more about Tambo at https://docs.tambo.co
 */

import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { DashboardCustomizer } from "@/components/tambo/dashboard-customizer";
import { PRListTable } from "@/components/tambo/pr-selection-table";

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
];
