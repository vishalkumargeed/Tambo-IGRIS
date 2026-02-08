"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { GitPullRequestIcon, IssueOpenedIcon } from "@primer/octicons-react"

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
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Repo stats
        </CardTitle>
        <CardDescription>
          Click a segment to view PRs or issues. Values from merged PRs, open PRs, open issues, closed issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 pt-0 sm:px-6">
        {!repo ? (
          <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
            Select a repository to see stats
          </div>
        ) : loading ? (
          <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm">
            Loading…
          </div>
        ) : total === 0 ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-4 text-muted-foreground text-sm">
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
          <ChartContainer
            config={chartConfig}
            className="aspect-square h-[280px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  paddingAngle={2}
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
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  content={({ payload }) => (
                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                      {data.map((item, index) => (
                        <Link
                          key={item.name}
                          href={item.route}
                          className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
                        >
                          <span
                            className="h-3 w-3 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className="text-sm">
                            {item.name}: {item.value.toLocaleString()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
