"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { GitPullRequestIcon, IssueOpenedIcon } from "@primer/octicons-react"
import { PieChart as PieChartIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useRepo } from "@/contexts/repo-context"

type Counts = {
  mergedPrs: number
  openPrs: number
  openIssues: number
  closedIssues: number
}

type StatItem = {
  name: string
  value: number
  fill: string
  route: string
}

const COLORS = [
  "hsl(262 83% 58%)", // purple - merged
  "hsl(142 71% 45%)", // green - open PRs
  "hsl(142 71% 45%)", // green - open issues
  "hsl(262 83% 58%)", // purple - closed
]

const chartConfig = {
  "Merged PRs": { label: "Merged PRs", color: COLORS[0] },
  "Open PRs": { label: "Open PRs", color: COLORS[1] },
  "Open Issues": { label: "Open Issues", color: COLORS[2] },
  "Closed Issues": { label: "Closed Issues", color: COLORS[3] },
} satisfies ChartConfig

/**
 * Radial/pie chart for repo stats. All 4 segments (Merged PRs, Open PRs,
 * Open Issues, Closed Issues) are clickable and navigate to the relevant route.
 */
export function StatsRadialChart() {
  const router = useRouter()
  const { repo } = useRepo()
  const [counts, setCounts] = React.useState<Counts | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!repo) {
      setCounts(null)
      return
    }
    setLoading(true)
    fetch(
      `/api/repoCounts?owner=${encodeURIComponent(repo.owner)}&repoName=${encodeURIComponent(repo.name)}`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((body: { success?: boolean; data?: Counts }) => {
        if (body.success && body.data) setCounts(body.data)
        else setCounts(null)
      })
      .catch(() => setCounts(null))
      .finally(() => setLoading(false))
  }, [repo?.owner, repo?.name])

  const data: StatItem[] = React.useMemo(() => {
    const merged = counts?.mergedPrs ?? 0
    const openPrs = counts?.openPrs ?? 0
    const openIssues = counts?.openIssues ?? 0
    const closedIssues = counts?.closedIssues ?? 0
    return [
      { name: "Merged PRs", value: merged, fill: COLORS[0], route: "/dashboard/pull-requests" },
      { name: "Open PRs", value: openPrs, fill: COLORS[1], route: "/dashboard/pull-requests" },
      { name: "Open Issues", value: openIssues, fill: COLORS[2], route: "/dashboard/issues" },
      { name: "Closed Issues", value: closedIssues, fill: COLORS[3], route: "/dashboard/issues" },
    ]
  }, [counts])

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card className="@container/card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="size-4 shrink-0 text-primary" aria-hidden />
          Repo stats
        </CardTitle>
        <CardDescription>
          Click a segment to view PRs or issues. 
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 overflow-hidden px-0 pt-0 pb-1">
        {!repo ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
            Select a repository to see stats
          </div>
        ) : loading ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
            Loading…
          </div>
        ) : total === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center gap-4 text-muted-foreground text-sm">
            <span>No PRs or issues yet</span>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard/pull-requests"
                className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-muted hover:text-foreground"
              >
                <GitPullRequestIcon size={16} />
                Pull Requests
              </Link>
              <Link
                href="/dashboard/issues"
                className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-muted hover:text-foreground"
              >
                <IssueOpenedIcon size={16} />
                Issues
              </Link>
            </div>
          </div>
        ) : (
          <div className="min-w-0 w-full">
            <ChartContainer
              config={chartConfig}
              className="aspect-square h-[180px] w-full max-w-full shrink-0"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={58}
                    innerRadius={26}
                    paddingAngle={1}
                    strokeWidth={1}
                    onClick={(_, index) => {
                      const item = data[index]
                      if (item) router.push(item.route)
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideIndicator={false}
                        formatter={(value) => (
                          <span className="font-mono tabular-nums">
                            {Number(value).toLocaleString()}
                            {total > 0 && (
                              <span className="text-muted-foreground ml-1">
                                ({Math.round((Number(value) / total) * 100)}%)
                              </span>
                            )}
                          </span>
                        )}
                      />
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-0.5 flex min-w-0 max-w-full flex-wrap justify-center gap-x-1.5 gap-y-0.5">
              {data.map((item) => (
                <Link
                  key={item.name}
                  href={item.route}
                  className="inline-flex min-w-0 max-w-full shrink-0 items-center gap-1 rounded px-0.5 py-0.5 transition-colors hover:bg-muted sm:max-w-[50%]"
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(item.route)
                  }}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-sm"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="min-w-0 truncate text-[11px] leading-tight">
                    {item.name}: {item.value.toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
