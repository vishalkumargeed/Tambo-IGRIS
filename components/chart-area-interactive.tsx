"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { StarIcon } from "@primer/octicons-react"
import { ChevronDown, ChevronUp, Code2, GitCommit } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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

type ViewType = "stars" | "commits" | "languages"

const starsChartConfig = {
  date: { label: "Date" },
  stars: { label: "Stars", color: "var(--primary)" },
} satisfies ChartConfig

const commitsChartConfig = {
  date: { label: "Week" },
  commits: { label: "Commits", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

const languagesChartConfig = {
  name: { label: "Language" },
  bytes: { label: "Bytes", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

/** Collapsed min-height to align with repo stats card (pie 180px + header + legend + padding) */
const COLLAPSED_MIN_HEIGHT = "320px"

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const { repo } = useRepo()
  const [view, setView] = React.useState<ViewType>("stars")
  const [timeRange, setTimeRange] = React.useState("3m")
  const [open, setOpen] = React.useState(true)

  const [starsData, setStarsData] = React.useState<{ date: string; stars: number }[]>([])
  const [commitsData, setCommitsData] = React.useState<{ date: string; weekStart: string; commits: number }[]>([])
  const [languagesData, setLanguagesData] = React.useState<{ name: string; bytes: number; percentage: number }[]>([])

  const [loadingStars, setLoadingStars] = React.useState(false)
  const [loadingCommits, setLoadingCommits] = React.useState(false)
  const [loadingLanguages, setLoadingLanguages] = React.useState(false)

  React.useEffect(() => {
    if (isMobile && timeRange === "6m") setTimeRange("3m")
  }, [isMobile, timeRange])

  React.useEffect(() => {
    if (!repo || view !== "stars") {
      setStarsData([])
      return
    }
    setLoadingStars(true)
    fetch(
      `/api/repoStars?owner=${encodeURIComponent(repo.owner)}&repoName=${encodeURIComponent(repo.name)}&range=${timeRange}`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((body: { success?: boolean; data?: { date: string; stars: number }[] }) => {
        if (body.success && Array.isArray(body.data)) setStarsData(body.data)
        else setStarsData([])
      })
      .catch(() => setStarsData([]))
      .finally(() => setLoadingStars(false))
  }, [repo?.owner, repo?.name, timeRange, view])

  React.useEffect(() => {
    if (!repo || view !== "commits") {
      setCommitsData([])
      return
    }
    setLoadingCommits(true)
    fetch(
      `/api/repoCommitActivity?owner=${encodeURIComponent(repo.owner)}&repoName=${encodeURIComponent(repo.name)}`
    )
      .then((res) => {
        if (res.status === 202) return res.json().then(() => ({ success: false, pending: true }))
        return res.ok ? res.json() : Promise.reject(new Error("Failed"))
      })
      .then((body: { success?: boolean; pending?: boolean; data?: { date: string; weekStart: string; commits: number }[] }) => {
        if (body.pending) setCommitsData([])
        else if (body.success && Array.isArray(body.data)) setCommitsData(body.data)
        else setCommitsData([])
      })
      .catch(() => setCommitsData([]))
      .finally(() => setLoadingCommits(false))
  }, [repo?.owner, repo?.name, view])

  React.useEffect(() => {
    if (!repo || view !== "languages") {
      setLanguagesData([])
      return
    }
    setLoadingLanguages(true)
    fetch(
      `/api/repoLanguages?owner=${encodeURIComponent(repo.owner)}&repoName=${encodeURIComponent(repo.name)}`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((body: { success?: boolean; data?: { name: string; bytes: number; percentage: number }[] }) => {
        if (body.success && Array.isArray(body.data)) setLanguagesData(body.data)
        else setLanguagesData([])
      })
      .catch(() => setLanguagesData([]))
      .finally(() => setLoadingLanguages(false))
  }, [repo?.owner, repo?.name, view])

  const rangeLabel = timeRange === "7d" ? "7 days" : timeRange === "3m" ? "3 months" : "6 months"
  const loading = view === "stars" ? loadingStars : view === "commits" ? loadingCommits : loadingLanguages

  const titleByView: Record<ViewType, { icon: React.ReactNode; label: string }> = {
    stars: { icon: <StarIcon size={20} className="shrink-0 text-yellow-500" />, label: "Repo insights" },
    commits: { icon: <GitCommit className="size-5 shrink-0 text-green-600" />, label: "Repo insights" },
    languages: { icon: <Code2 className="size-5 shrink-0 text-primary" />, label: "Repo insights" },
  }

  const descriptionByView: Record<ViewType, string> = {
    stars: `Star count over the last ${rangeLabel}`,
    commits: "Weekly commit activity (last year)",
    languages: "Language breakdown by bytes",
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <Card
        className="@container/card"
        style={!open ? { minHeight: COLLAPSED_MIN_HEIGHT } : undefined}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none hover:opacity-90">
            <CardTitle className="flex items-center gap-2">
              {titleByView[view].icon}
              {titleByView[view].label}
              {open ? (
                <ChevronUp className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              ) : (
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              )}
            </CardTitle>
            <CardDescription>
              <span className="hidden @[540px]/card:block">{descriptionByView[view]}</span>
              <span className="@[540px]/card:hidden">{descriptionByView[view]}</span>
            </CardDescription>
            <CardAction className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Select value={view} onValueChange={(v) => setView(v as ViewType)}>
                <SelectTrigger className="w-[140px]" size="sm" aria-label="Chart type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stars">Stars</SelectItem>
                  <SelectItem value="commits">Commit activity</SelectItem>
                  <SelectItem value="languages">Languages</SelectItem>
                </SelectContent>
              </Select>
              {view === "stars" && (
                <ToggleGroup
                  type="single"
                  value={timeRange}
                  onValueChange={(v) => v && setTimeRange(v)}
                  variant="outline"
                  className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex [&_[data-slot=toggle-group-item]]:hover:!bg-green-500/15 [&_[data-slot=toggle-group-item][data-state=on]]:!bg-green-600 [&_[data-slot=toggle-group-item][data-state=on]]:!text-white [&_[data-slot=toggle-group-item][data-state=on]]:border-green-600 dark:[&_[data-slot=toggle-group-item][data-state=on]]:!bg-green-600 dark:[&_[data-slot=toggle-group-item][data-state=on]]:!text-white"
                >
                  <ToggleGroupItem value="7d">7d</ToggleGroupItem>
                  <ToggleGroupItem value="3m">3m</ToggleGroupItem>
                  <ToggleGroupItem value="6m">6m</ToggleGroupItem>
                </ToggleGroup>
              )}
            </CardAction>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
      <CardContent className="min-w-0 w-full px-3 pt-2 sm:px-4 sm:pt-3">
        {!repo ? (
          <div className="flex h-[180px] items-center justify-center text-muted-foreground text-sm">
            Select a repository
          </div>
        ) : loading ? (
          <div className="flex h-[180px] items-center justify-center text-muted-foreground text-sm">
            Loading…
          </div>
        ) : view === "stars" ? (
          starsData.length === 0 ? (
            <div className="flex h-[180px] items-center justify-center text-muted-foreground text-sm">
              No star data in this range
            </div>
          ) : (
            <ChartContainer config={starsChartConfig} className="aspect-auto h-[180px] w-full min-h-0">
              <AreaChart data={starsData}>
                <defs>
                  <linearGradient id="fillStars" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-stars)" stopOpacity={1.0} />
                    <stop offset="95%" stopColor="var(--color-stars)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      }
                      indicator="dot"
                    />
                  }
                />
                <Area dataKey="stars" type="natural" fill="url(#fillStars)" stroke="var(--color-stars)" />
              </AreaChart>
            </ChartContainer>
          )
        ) : view === "commits" ? (
          commitsData.length === 0 ? (
            <div className="flex h-[180px] items-center justify-center text-muted-foreground text-sm">
              No commit activity (or still computing). Repos with 10k+ commits may not support this.
            </div>
          ) : (
            <ChartContainer config={commitsChartConfig} className="aspect-auto h-[180px] w-full min-h-0">
              <BarChart data={commitsData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="weekStart"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tick={{ fontSize: 10 }}
                />
                <YAxis hide />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-mono tabular-nums">{Number(value).toLocaleString()} commits</span>
                      )}
                    />
                  }
                />
                <Bar dataKey="commits" fill="var(--color-commits)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )
        ) : (
          languagesData.length === 0 ? (
            <div className="flex h-[180px] items-center justify-center text-muted-foreground text-sm">
              No language data
            </div>
          ) : (
            <ChartContainer config={languagesChartConfig} className="aspect-auto h-[180px] w-full min-h-0">
              <BarChart data={languagesData} margin={{ left: 12, right: 12, bottom: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tick={{ fontSize: 11 }}
                />
                <YAxis hide />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => (
                        <span className="font-mono tabular-nums">
                          {item?.payload?.percentage ?? 0}% · {(Number(value) / 1024).toFixed(1)} KB
                        </span>
                      )}
                    />
                  }
                />
                <Bar dataKey="bytes" fill="var(--color-bytes)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          )
        )}
      </CardContent>
        </CollapsibleContent>
    </Card>
    </Collapsible>
  )
}
