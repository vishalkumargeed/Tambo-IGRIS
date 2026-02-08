"use client"

import * as React from "react"
import Link from "next/link"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Users, Bot, Building2 } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import { useRepo } from "@/contexts/repo-context"

type ContributorRow = {
  id: number
  login: string
  avatarUrl: string
  contributions: number
  type: string
  htmlUrl: string
}

const TYPE_COLORS = {
  User: "hsl(142 71% 45%)",
  Bot: "hsl(262 83% 58%)",
  Organization: "hsl(38 92% 50%)",
} as const

const chartConfig = {
  User: { label: "Users", color: TYPE_COLORS.User },
  Bot: { label: "Bots", color: TYPE_COLORS.Bot },
  Organization: { label: "Organizations", color: TYPE_COLORS.Organization },
} satisfies ChartConfig

const TOP_N = 5

/**
 * Compact insights: contributor type breakdown (User/Bot/Org) + top 5 contributors
 * with avatars and links to GitHub profiles.
 */
export function ContributorInsightsCard() {
  const { repo } = useRepo()
  const [data, setData] = React.useState<ContributorRow[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!repo) {
      setData([])
      return
    }
    setLoading(true)
    fetch(
      `/api/repoContributors?owner=${encodeURIComponent(repo.owner)}&repoName=${encodeURIComponent(repo.name)}&limit=50`
    )
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((body: { success?: boolean; data?: ContributorRow[] }) => {
        if (body.success && Array.isArray(body.data)) setData(body.data)
        else setData([])
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [repo?.owner, repo?.name])

  const typeCounts = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of data) {
      const t = c.type === "Bot" || c.type === "Organization" ? c.type : "User"
      counts[t] = (counts[t] ?? 0) + 1
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0)
  }, [data])

  const topContributors = React.useMemo(
    () => data.slice(0, TOP_N),
    [data]
  )

  if (!repo) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4 shrink-0 text-primary" aria-hidden />
          Contributor insights
        </CardTitle>
        <CardDescription>
          Type breakdown and top contributors from the last 50
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex h-[120px] items-center justify-center text-muted-foreground text-sm">
            Loading…
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[80px] items-center justify-center text-muted-foreground text-sm">
            No contributor data
          </div>
        ) : (
          <>
            {typeCounts.length > 0 && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex h-[80px] w-full min-w-0 max-w-[140px] shrink-0 self-center sm:self-auto">
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeCounts}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={22}
                          outerRadius={36}
                          paddingAngle={1}
                          strokeWidth={0}
                        >
                          {typeCounts.map((entry, i) => (
                            <Cell
                              key={entry.name}
                              fill={
                                TYPE_COLORS[entry.name as keyof typeof TYPE_COLORS] ??
                                "hsl(var(--muted-foreground))"
                              }
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {typeCounts.map(({ name, value }) => (
                    <span key={name} className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            TYPE_COLORS[name as keyof typeof TYPE_COLORS] ?? "hsl(var(--muted-foreground))",
                        }}
                      />
                      {name === "User" && <Users className="size-3.5 text-muted-foreground" />}
                      {name === "Bot" && <Bot className="size-3.5 text-muted-foreground" />}
                      {name === "Organization" && <Building2 className="size-3.5 text-muted-foreground" />}
                      <span className="text-muted-foreground">{name}s:</span>
                      <span className="font-medium tabular-nums">{value}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {topContributors.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-muted-foreground mb-2 text-xs font-medium">Top {TOP_N} by contributions</p>
                <ul className="flex flex-col gap-1.5">
                  {topContributors.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={c.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:bg-muted flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors"
                      >
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage src={c.avatarUrl} alt={c.login} />
                          <AvatarFallback className="text-xs">
                            {c.login.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1 truncate font-medium">{c.login}</span>
                        <span className="text-muted-foreground shrink-0 tabular-nums text-sm">
                          {c.contributions.toLocaleString()} contributions
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
