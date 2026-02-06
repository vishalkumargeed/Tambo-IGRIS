"use client"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { useRepo } from "@/contexts/repo-context"

export function DashboardContent() {
  const { repo } = useRepo()

  if (!repo) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <h2 className="text-center text-xl font-semibold text-muted-foreground md:text-2xl">
          Tambo Sentinel → Select a repo (Look up)
        </h2>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable />
        </div>
      </div>
    </div>
  )
}
