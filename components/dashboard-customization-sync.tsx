"use client"

import { useTheme } from "next-themes"
import { useDashboardCustomization } from "@/contexts/dashboard-customization-context"
import { useEffect } from "react"

/**
 * Syncs dashboard customization theme to next-themes.
 * When user asks Tambo to "make it dark", DashboardCustomizer sets theme: "dark",
 * and this component applies it.
 */
export function DashboardThemeSync() {
  const { merged } = useDashboardCustomization()
  const { setTheme } = useTheme()

  useEffect(() => {
    if (merged.theme && merged.theme !== "system") {
      setTheme(merged.theme)
    }
  }, [merged.theme, setTheme])

  return null
}
