"use client"

import * as React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useDashboardCustomization } from "@/contexts/dashboard-customization-context"

const sidebarWidthMap = {
  narrow: "calc(var(--spacing) * 48)",
  default: "calc(var(--spacing) * 72)",
  wide: "calc(var(--spacing) * 96)",
} as const

export function DashboardSidebarWrapper({ children }: { children: React.ReactNode }) {
  const { merged } = useDashboardCustomization()
  const width = sidebarWidthMap[merged.sidebarWidth] ?? sidebarWidthMap.default

  const style = React.useMemo(
    () =>
      ({
        "--sidebar-width": width,
        "--header-height": "calc(var(--spacing) * 12)",
      }) as React.CSSProperties,
    [width],
  )

  return <SidebarProvider style={style}>{children}</SidebarProvider>
}
