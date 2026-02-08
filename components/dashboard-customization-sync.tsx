"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"
import { useDashboardCustomization } from "@/contexts/dashboard-customization-context"

/** Accent keys that have [data-accent="..."] rules in globals.css */
const ACCENT_KEYS = new Set([
  "amber", "blue", "cyan", "emerald", "fuchsia", "green", "indigo", "lime",
  "orange", "pink", "purple", "red", "rose", "sky", "teal", "violet", "yellow",
])

/**
 * Syncs dashboard customization to the app:
 * - Theme (light/dark) to next-themes
 * - Accent color to :root data-accent (globals.css applies --accent/--accent-foreground)
 */
export function DashboardThemeSync() {
  const { merged } = useDashboardCustomization()
  const { setTheme } = useTheme()

  useEffect(() => {
    if (merged.theme && merged.theme !== "system") {
      setTheme(merged.theme)
    }
  }, [merged.theme, setTheme])

  useEffect(() => {
    const key = merged.accentColor?.trim() ?? ""
    if (key && ACCENT_KEYS.has(key)) {
      document.documentElement.setAttribute("data-accent", key)
    } else {
      document.documentElement.removeAttribute("data-accent")
    }
  }, [merged.accentColor])

  return null
}
