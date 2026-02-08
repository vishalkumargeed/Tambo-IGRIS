"use client"

import Link from "next/link"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ContributorInsightsCard } from "@/components/contributor-insights-card"
import { ContributorsBarChart } from "@/components/contributors-bar-chart"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { StatsRadialChart } from "@/components/stats-radial-chart"
import { useRepo } from "@/contexts/repo-context"
import { useDashboardCustomization } from "@/contexts/dashboard-customization-context"

export function DashboardContent() {
  const { repo } = useRepo()
  const { merged } = useDashboardCustomization()

  if (!repo) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <h2 className="text-center text-xl font-semibold text-muted-foreground md:text-2xl">
          Tambo Sentinel → Select a repo (Look up)
        </h2>
      </div>
    )
  }

  const hasAnySection =
    merged.showSectionCards || merged.showChart || merged.showDataTable

  if (!hasAnySection) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
        <h2 className="text-center text-xl font-semibold text-muted-foreground md:text-2xl">
          Check examples or ask Sentinel: &quot;show all the dashboard components&quot;
        </h2>
        <Link
          href="/dashboard/examples"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View example prompts
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {merged.showSectionCards && merged.statsDisplayVariant === "radial" && merged.showChart ? (
            <div className="flex flex-col gap-4 px-4 md:gap-6 lg:flex-row lg:items-stretch lg:gap-6 lg:px-6">
              <div className="min-w-0 w-full shrink-0 lg:w-[320px]">
                <StatsRadialChart />
              </div>
              <div className="min-w-0 flex-1 w-full">
                <ChartAreaInteractive />
              </div>
            </div>
          ) : (
            <>
              {merged.showSectionCards &&
                (merged.statsDisplayVariant === "radial" ? (
                  <div className="px-4 lg:px-6">
                    <StatsRadialChart />
                  </div>
                ) : (
                  <SectionCards />
                ))}
              {merged.showChart && (
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
              )}
            </>
          )}
          {merged.showDataTable &&
            (merged.contributorsDisplayVariant === "bar" ? (
              <div className="flex flex-col gap-4 px-4 md:gap-6 lg:flex-row lg:items-stretch lg:px-6">
                <div className="min-w-0 shrink-0 lg:w-[280px] xl:w-[320px]">
                  <ContributorInsightsCard />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <ContributorsBarChart />
                </div>
              </div>
            ) : (
              <DataTable />
            ))}
        </div>
      </div>
    </div>
  )
}
