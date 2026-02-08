"use client"

import * as React from "react"
import { useDashboardCustomization } from "@/contexts/dashboard-customization-context"

export interface DashboardCustomizerProps {
  /** Set theme: light, dark, or system */
  theme?: "light" | "dark" | "system"
  /** Card layout: grid (4 cards), compact (2x2 tighter), minimal (simple list) */
  cardLayout?: "grid" | "compact" | "minimal"
  /** Stats display: cards (4 cards) or radial (pie chart with clickable segments) */
  statsDisplayVariant?: "cards" | "radial"
  /** Show the section cards (PR/Issue counts) */
  showSectionCards?: boolean
  /** Show the chart area */
  showChart?: boolean
  /** Show the data table */
  showDataTable?: boolean
  /** Contributors section: table (default) or bar (interactive bar chart) */
  contributorsDisplayVariant?: "table" | "bar"
  /** Sidebar width: narrow, default, wide */
  sidebarWidth?: "narrow" | "default" | "wide"
  /** Accent color (e.g. #3b82f6 or blue) */
  accentColor?: string
  /** Card style: default, bordered, flat */
  cardStyle?: "default" | "bordered" | "flat"
  /** Reset all customizations to default */
  reset?: boolean
}

/**
 * Tambo component: Customize the dashboard look.
 * When the user asks Tambo to change the dashboard (e.g. "make it darker", "hide the chart"),
 * Tambo renders this component with the appropriate props.
 */
export function DashboardCustomizer({
  theme,
  cardLayout,
  statsDisplayVariant,
  showSectionCards,
  showChart,
  showDataTable,
  contributorsDisplayVariant,
  sidebarWidth,
  accentColor,
  cardStyle,
  reset,
}: DashboardCustomizerProps) {
  const { updateCustomization, resetCustomization } = useDashboardCustomization()

  React.useEffect(() => {
    if (reset) {
      resetCustomization()
      return
    }
    const updates: Parameters<typeof updateCustomization>[0] = {}
    if (theme !== undefined) updates.theme = theme
    if (cardLayout !== undefined) updates.cardLayout = cardLayout
    if (statsDisplayVariant !== undefined) updates.statsDisplayVariant = statsDisplayVariant
    if (showSectionCards !== undefined) updates.showSectionCards = showSectionCards
    if (showChart !== undefined) updates.showChart = showChart
    if (showDataTable !== undefined) updates.showDataTable = showDataTable
    if (contributorsDisplayVariant !== undefined) updates.contributorsDisplayVariant = contributorsDisplayVariant
    if (sidebarWidth !== undefined) updates.sidebarWidth = sidebarWidth
    if (accentColor !== undefined) updates.accentColor = accentColor
    if (cardStyle !== undefined) updates.cardStyle = cardStyle
    if (Object.keys(updates).length > 0) {
      updateCustomization(updates)
    }
  }, [
    theme,
    cardLayout,
    statsDisplayVariant,
    showSectionCards,
    showChart,
    showDataTable,
    contributorsDisplayVariant,
    sidebarWidth,
    accentColor,
    cardStyle,
    reset,
    updateCustomization,
    resetCustomization,
  ])

  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
      <p className="font-medium">Dashboard updated</p>
      <p className="text-muted-foreground mt-1">
        Your customization has been applied. The dashboard will reflect your preferences.
      </p>
    </div>
  )
}
