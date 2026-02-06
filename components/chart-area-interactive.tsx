"use client"

import * as React from "react"
import { StarIcon } from "@primer/octicons-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useRepo } from "@/contexts/repo-context"

const chartConfig = {
  date: { label: "Date" },
  stars: {
    label: "Stars",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const { repo } = useRepo()
  const [timeRange, setTimeRange] = React.useState("3m")
  const [chartData, setChartData] = React.useState<{ date: string; stars: number }[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (isMobile && timeRange === "6m") setTimeRange("3m")
  }, [isMobile, timeRange])

  React.useEffect(() => {
    if (!repo) {
      setChartData([])
      return
    }
    setLoading(true)
    fetch(
      `/api/repoStars?owner=${encodeURIComponent(repo.owner)}&repoName=${encodeURIComponent(repo.name)}&range=${timeRange}`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((body: { success?: boolean; data?: { date: string; stars: number }[] }) => {
        if (body.success && Array.isArray(body.data)) setChartData(body.data)
        else setChartData([])
      })
      .catch(() => setChartData([]))
      .finally(() => setLoading(false))
  }, [repo?.owner, repo?.name, timeRange])

  const rangeLabel =
    timeRange === "7d" ? "7 days" : timeRange === "3m" ? "3 months" : "6 months"

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StarIcon size={20} className="text-yellow-500 shrink-0" />
          Repo stars
        </CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            New stars over the last {rangeLabel}
          </span>
          <span className="@[540px]/card:hidden">Last {rangeLabel}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v) => v && setTimeRange(v)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="7d">7 days</ToggleGroupItem>
            <ToggleGroupItem value="3m">3 months</ToggleGroupItem>
            <ToggleGroupItem value="6m">6 months</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue placeholder="3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                7 days
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                3 months
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg">
                6 months
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {!repo ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
            Select a repository to see stars
          </div>
        ) : loading ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
            Loading…
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground text-sm">
            No star data in this range
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillStars" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-stars)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-stars)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="stars"
                type="natural"
                fill="url(#fillStars)"
                stroke="var(--color-stars)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
