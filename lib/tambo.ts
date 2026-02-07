/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * Read more about Tambo at https://docs.tambo.co
 */

import type { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";
import { DashboardCustomizer } from "@/components/tambo/dashboard-customizer";

/**
 * Components Array - AI can render these when the user asks.
 * DashboardCustomizer lets users customize the dashboard look via natural language.
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
];
