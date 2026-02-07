"use client"

import * as React from "react"
import Link from "next/link"
import {
  GitMergeIcon,
  GitPullRequestIcon,
  IssueOpenedIcon,
  IssueClosedIcon,
} from "@primer/octicons-react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRepo } from "@/contexts/repo-context"
import { useDashboardCustomization } from "@/contexts/dashboard-customization-context"
import { cn } from "@/lib/utils"

type Counts = {
  mergedPrs: number
  openPrs: number
  openIssues: number
  closedIssues: number
}

export function SectionCards() {
  const { repo } = useRepo()
  const { merged } = useDashboardCustomization()
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

  const mergedPrs = counts?.mergedPrs ?? 0
  const openPrs = counts?.openPrs ?? 0
  const openIssues = counts?.openIssues ?? 0
  const closedIssues = counts?.closedIssues ?? 0

  const layoutClass =
    merged.cardLayout === "compact"
      ? "grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-3"
      : merged.cardLayout === "minimal"
        ? "grid-cols-1 @xl/main:grid-cols-2 gap-3"
        : "grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-4"
  const cardStyleClass =
    merged.cardStyle === "bordered"
      ? "[&_[data-slot=card]]:border-2 [&_[data-slot=card]]:border-border"
      : merged.cardStyle === "flat"
        ? "[&_[data-slot=card]]:border-0 [&_[data-slot=card]]:shadow-none"
        : ""

  return (
    <div
      className={cn(
        "*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6",
        layoutClass,
        cardStyleClass
      )}
    >
      <Link href="/dashboard/pull-requests" className="block transition-opacity hover:opacity-95">
        <Card className="@container/card cursor-pointer">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <GitMergeIcon size={16} className="text-purple-600 shrink-0" />
              Merged Pull Requests
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {repo ? (loading ? "…" : mergedPrs.toLocaleString()) : "—"}
            </CardTitle>
            <CardAction />
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Survival rate increasing <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              PRs that actually survived Tambo&apos;s existential interrogation.
            </div>
          </CardFooter>
        </Card>
      </Link>
      <Link href="/dashboard/pull-requests" className="block transition-opacity hover:opacity-95">
        <Card className="@container/card cursor-pointer">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <GitPullRequestIcon size={16} className="text-green-600 shrink-0" />
              Open Pull Requests
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {repo ? (loading ? "…" : openPrs.toLocaleString()) : "—"}
            </CardTitle>
            <CardAction />
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Commitment issues detected <IconTrendingDown className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Contributors are clearly intimidated by a bot that&apos;s smarter.
            </div>
          </CardFooter>
        </Card>
      </Link>
      <Link href="/dashboard/issues" className="block transition-opacity hover:opacity-95">
        <Card className="@container/card cursor-pointer">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <IssueOpenedIcon size={16} className="text-green-600 shrink-0" />
              New Issues
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {repo ? (loading ? "…" : openIssues.toLocaleString()) : "—"}
            </CardTitle>
            <CardAction />
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Unmatched user persistence <IconTrendingUp className="size-4" />
            </div>
            <div className="text-muted-foreground">
              The &quot;Issues&quot; tab is officially more active than the codebase.
            </div>
          </CardFooter>
        </Card>
      </Link>
      <Link href="/dashboard/issues" className="block transition-opacity hover:opacity-95">
        <Card className="@container/card cursor-pointer">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <IssueClosedIcon size={16} className="text-purple-600 shrink-0" />
              Closed Issues
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {repo ? (loading ? "…" : closedIssues.toLocaleString()) : "—"}
            </CardTitle>
            <CardAction />
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Production is suspiciously quiet <IconTrendingDown className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Fewer merges means fewer things for Tambo to fix later.
            </div>
          </CardFooter>
        </Card>
      </Link>
    </div>
  )
}
