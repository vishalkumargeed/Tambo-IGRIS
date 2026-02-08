"use client"

import * as React from "react"
import { useDashboardCustomization } from "@/contexts/dashboard-customization-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Value for "no accent" (uses default from globals.css). Radix Select does not allow empty string. */
const DEFAULT_ACCENT_KEY = "default"

/** Hex for swatch display (must match globals.css [data-accent] values) */
const ACCENT_SWATCH: Record<string, string> = {
  amber: "#f59e0b",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  emerald: "#10b981",
  fuchsia: "#d946ef",
  green: "#22c55e",
  indigo: "#6366f1",
  lime: "#84cc16",
  orange: "#f97316",
  pink: "#ec4899",
  purple: "#a855f7",
  red: "#ef4444",
  rose: "#f43f5e",
  sky: "#0ea5e9",
  teal: "#14b8a6",
  violet: "#8b5cf6",
  yellow: "#eab308",
}

/** Accent theme keys; must match data-accent values in globals.css */
export const THEME_COLOR_OPTIONS: { name: string; value: string }[] = [
  { name: "Default", value: DEFAULT_ACCENT_KEY },
  { name: "Amber", value: "amber" },
  { name: "Blue", value: "blue" },
  { name: "Cyan", value: "cyan" },
  { name: "Emerald", value: "emerald" },
  { name: "Fuchsia", value: "fuchsia" },
  { name: "Green", value: "green" },
  { name: "Indigo", value: "indigo" },
  { name: "Lime", value: "lime" },
  { name: "Orange", value: "orange" },
  { name: "Pink", value: "pink" },
  { name: "Purple", value: "purple" },
  { name: "Red", value: "red" },
  { name: "Rose", value: "rose" },
  { name: "Sky", value: "sky" },
  { name: "Teal", value: "teal" },
  { name: "Violet", value: "violet" },
  { name: "Yellow", value: "yellow" },
]

export interface ThemeColorPickerProps {
  /** Optional label (e.g. "Pick a theme color") */
  label?: string
}

/**
 * Tambo component: Renders a dropdown of accent colors. When the user selects an option,
 * the dashboard accent color updates instantly (no AI round-trip). Use when the user
 * asks to change the theme color, pick a color, or set an accent color.
 */
export function ThemeColorPicker({ label }: ThemeColorPickerProps) {
  const { merged, updateCustomization } = useDashboardCustomization()
  const currentValue = merged.accentColor ?? ""
  const valueForSelect =
    THEME_COLOR_OPTIONS.find((o) => o.value === currentValue || (o.value === DEFAULT_ACCENT_KEY && !currentValue))?.value ?? DEFAULT_ACCENT_KEY

  const handleChange = React.useCallback(
    (value: string) => {
      updateCustomization({ accentColor: value === DEFAULT_ACCENT_KEY ? "" : value })
    },
    [updateCustomization],
  )

  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
      <p className="font-medium">{label ?? "Theme color"}</p>
      <p className="text-muted-foreground mt-1 mb-3">
        Choose an accent color. The dashboard updates as soon as you select.
      </p>
      <Select
        value={valueForSelect}
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-full max-w-[220px]" size="sm" aria-label="Accent color">
          <SelectValue placeholder="Select color" />
        </SelectTrigger>
        <SelectContent>
          {THEME_COLOR_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <span className="flex items-center gap-2">
                {opt.value && opt.value !== DEFAULT_ACCENT_KEY && ACCENT_SWATCH[opt.value] ? (
                  <span
                    className="size-4 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: ACCENT_SWATCH[opt.value] }}
                    aria-hidden
                  />
                ) : (
                  <span className="size-4 shrink-0 rounded-full border border-border bg-muted" aria-hidden />
                )}
                {opt.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
