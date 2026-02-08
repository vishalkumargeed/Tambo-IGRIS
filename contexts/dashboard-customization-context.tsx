"use client"

import * as React from "react"

const STORAGE_KEY = "tambo-dashboard-customization"

export type DashboardCustomization = {
  /** Light, dark, or follow system */
  theme?: "light" | "dark" | "system"
  /** Card layout on main dashboard */
  cardLayout?: "grid" | "compact" | "minimal"
  /** Stats display: cards (4 cards) or radial (pie/radial chart with clickable segments) */
  statsDisplayVariant?: "cards" | "radial"
  /** Show/hide dashboard sections */
  showSectionCards?: boolean
  showChart?: boolean
  showDataTable?: boolean
  /** Contributors section: table (default) or bar (interactive bar chart) */
  contributorsDisplayVariant?: "table" | "bar"
  /** Sidebar width */
  sidebarWidth?: "narrow" | "default" | "wide"
  /** Accent color (CSS color or hex) */
  accentColor?: string
  /** Card style */
  cardStyle?: "default" | "bordered" | "flat"
}

const defaults: Required<DashboardCustomization> = {
  theme: "system",
  cardLayout: "grid",
  statsDisplayVariant: "cards",
  showSectionCards: true,
  showChart: true,
  showDataTable: true,
  contributorsDisplayVariant: "table",
  sidebarWidth: "default",
  accentColor: "",
  cardStyle: "default",
}

function loadFromStorage(): DashboardCustomization {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const out: DashboardCustomization = {}
    if (parsed.theme === "light" || parsed.theme === "dark" || parsed.theme === "system")
      out.theme = parsed.theme
    if (parsed.cardLayout === "grid" || parsed.cardLayout === "compact" || parsed.cardLayout === "minimal")
      out.cardLayout = parsed.cardLayout
    if (parsed.statsDisplayVariant === "cards" || parsed.statsDisplayVariant === "radial")
      out.statsDisplayVariant = parsed.statsDisplayVariant
    if (typeof parsed.showSectionCards === "boolean") out.showSectionCards = parsed.showSectionCards
    if (typeof parsed.showChart === "boolean") out.showChart = parsed.showChart
    if (typeof parsed.showDataTable === "boolean") out.showDataTable = parsed.showDataTable
    if (parsed.contributorsDisplayVariant === "table" || parsed.contributorsDisplayVariant === "bar")
      out.contributorsDisplayVariant = parsed.contributorsDisplayVariant
    if (parsed.sidebarWidth === "narrow" || parsed.sidebarWidth === "default" || parsed.sidebarWidth === "wide")
      out.sidebarWidth = parsed.sidebarWidth
    if (typeof parsed.accentColor === "string" && parsed.accentColor) out.accentColor = parsed.accentColor
    if (parsed.cardStyle === "default" || parsed.cardStyle === "bordered" || parsed.cardStyle === "flat")
      out.cardStyle = parsed.cardStyle
    return out
  } catch {
    return {}
  }
}

function saveToStorage(custom: DashboardCustomization) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom))
    window.dispatchEvent(new CustomEvent("dashboard-customization-updated", { detail: custom }))
  } catch {
    /* ignore */
  }
}

type DashboardCustomizationContextValue = {
  customization: DashboardCustomization
  merged: Required<DashboardCustomization>
  updateCustomization: (updates: Partial<DashboardCustomization>) => void
  resetCustomization: () => void
}

const DashboardCustomizationContext = React.createContext<
  DashboardCustomizationContextValue | undefined
>(undefined)

export function DashboardCustomizationProvider({ children }: { children: React.ReactNode }) {
  const [customization, setCustomization] = React.useState<DashboardCustomization>(loadFromStorage)

  React.useEffect(() => {
    const handler = () => setCustomization(loadFromStorage())
    window.addEventListener("dashboard-customization-updated", handler)
    return () => window.removeEventListener("dashboard-customization-updated", handler)
  }, [])

  const merged = React.useMemo(
    () => ({
      ...defaults,
      ...customization,
    }),
    [customization]
  )

  const updateCustomization = React.useCallback((updates: Partial<DashboardCustomization>) => {
    setCustomization((prev) => {
      const next = { ...prev, ...updates }
      saveToStorage(next)
      return next
    })
  }, [])

  const resetCustomization = React.useCallback(() => {
    setCustomization({})
    saveToStorage({})
  }, [])

  const value = React.useMemo(
    () => ({
      customization,
      merged,
      updateCustomization,
      resetCustomization,
    }),
    [customization, merged, updateCustomization, resetCustomization]
  )

  return (
    <DashboardCustomizationContext.Provider value={value}>
      {children}
    </DashboardCustomizationContext.Provider>
  )
}

export function useDashboardCustomization() {
  const ctx = React.useContext(DashboardCustomizationContext)
  if (!ctx) {
    return {
      customization: {} as DashboardCustomization,
      merged: defaults,
      updateCustomization: () => {},
      resetCustomization: () => {},
    }
  }
  return ctx
}
