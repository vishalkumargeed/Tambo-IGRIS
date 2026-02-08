"use client"

import * as React from "react"

const STORAGE_KEY_BASE = "tambo-dashboard-customization"

function getStorageKey(userId: string | null | undefined): string {
  return userId ? `${STORAGE_KEY_BASE}-${userId}` : STORAGE_KEY_BASE
}

export type DashboardCustomization = {

  theme?: "light" | "dark" | "system"
  cardLayout?: "grid" | "compact" | "minimal"
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

function loadFromStorage(userId: string | null | undefined): DashboardCustomization {
  if (typeof window === "undefined") return {}
  try {
    const key = getStorageKey(userId)
    let raw = localStorage.getItem(key)
    // One-time migration: if user-scoped key is empty but legacy key has data, migrate it
    if (!raw && userId) {
      const legacy = localStorage.getItem(STORAGE_KEY_BASE)
      if (legacy) {
        localStorage.setItem(key, legacy)
        raw = legacy
      }
    }
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

function saveToStorage(custom: DashboardCustomization, userId: string | null | undefined) {
  if (typeof window === "undefined") return
  try {
    const key = getStorageKey(userId)
    localStorage.setItem(key, JSON.stringify(custom))
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

export function DashboardCustomizationProvider({
  children,
  userId,
}: {
  children: React.ReactNode
  /** When set, UI preferences are stored per-user so they persist across logout/login */
  userId?: string | null
}) {
  const [customization, setCustomization] = React.useState<DashboardCustomization>(() =>
    loadFromStorage(userId)
  )

  /* Sync from localStorage on mount and when userId changes (e.g. after login) */
  React.useEffect(() => {
    setCustomization(loadFromStorage(userId))
  }, [userId])

  React.useEffect(() => {
    const handler = () => setCustomization(loadFromStorage(userId))
    window.addEventListener("dashboard-customization-updated", handler)
    return () => window.removeEventListener("dashboard-customization-updated", handler)
  }, [userId])

  const merged = React.useMemo(
    () => ({
      ...defaults,
      ...customization,
    }),
    [customization]
  )

  const updateCustomization = React.useCallback(
    (updates: Partial<DashboardCustomization>) => {
      setCustomization((prev) => {
        const next = { ...prev, ...updates }
        saveToStorage(next, userId)
        return next
      })
    },
    [userId]
  )

  const resetCustomization = React.useCallback(() => {
    setCustomization({})
    saveToStorage({}, userId)
  }, [userId])

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
