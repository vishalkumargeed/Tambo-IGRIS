"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { BarChart3 } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRepo } from "@/contexts/repo-context"

type ContributorRow = {
  id: number
  login: string
  avatarUrl: string
  contributions: number
  type: string
  htmlUrl: string
}

const CONTRIBUTOR_LIMITS = [10, 50, 200] as const

const chartConfig = {
  contributions: {
    label: "Contributions",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function ContributorsBarChart() {
  const { repo } = useRepo()
  const [limit, setLimit] = React.useState<number>(10)
  const [data, setData] = React.useState<ContributorRow[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!repo) {
      setData([])
      return
    }
    setLoading(true)
    fetch(
      `/api/repoContributors?owner=${encodeURIComponent(repo.owner)}&repoName=${encodeURIComponent(repo.name)}&limit=${limit}`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((body: { success?: boolean; data?: ContributorRow[] }) => {
        if (body.success && Array.isArray(body.data)) setData(body.data)
        else setData([])
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [repo?.owner, repo?.name, limit])

  const chartData = React.useMemo(
    () =>
      data.map((c) => ({
        login: c.login,
        contributions: c.contributions,
        htmlUrl: c.htmlUrl,
      })),
    [data]
  )

  const handleBarClick = React.useCallback(
    (payload: { login?: string; contributions?: number; htmlUrl?: string }) => {
      const url = payload?.htmlUrl
      if (url) window.open(url, "_blank", "noopener,noreferrer")
    },
    []
  )

  const totalContributions = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.contributions, 0),
    [chartData]
  )

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-4 shrink-0 text-primary" aria-hidden />
            Top contributors
          </CardTitle>
          <CardDescription>
            Contribution count by contributor. Select how many to show.
          </CardDescription>
        </div>
        <Select
          value={String(limit)}
          onValueChange={(v) => setLimit(Number(v) as typeof limit)}
          disabled={!repo}
        >
          <SelectTrigger className="w-[100px]" aria-label="Number of contributors">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            {CONTRIBUTOR_LIMITS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:p-6">
        {!repo ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
            Select a repository to see contributors
          </div>
        ) : loading ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
            Loading…
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
            No contributors found
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="login"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    formatter={(value, name, item) => (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono tabular-nums">
                          {Number(value).toLocaleString()} contributions
                        </span>
                        <span className="text-muted-foreground text-[10px]">
                          Click bar to open GitHub profile
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey="contributions"
                fill="var(--color-contributions)"
                radius={[4, 4, 0, 0]}
                onClick={(entry) => handleBarClick(entry)}
                style={{ cursor: "pointer" }}
              />
            </BarChart>
          </ChartContainer>
        )}
        {!loading && repo && chartData.length > 0 && (
          <p className="text-muted-foreground mt-2 text-xs">
            Top {chartData.length} contributors · {totalContributions.toLocaleString()} total contributions
          </p>
        )}
      </CardContent>
    </Card>
  )
}
