"use client"

import * as React from "react"
import Link from "next/link"
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

type Counts = {
  mergedPrs: number
  openPrs: number
  openIssues: number
  closedIssues: number
}

export function SectionCards() {
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

  const mergedPrs = counts?.mergedPrs ?? 0
  const openPrs = counts?.openPrs ?? 0
  const openIssues = counts?.openIssues ?? 0
  const closedIssues = counts?.closedIssues ?? 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Link href="/dashboard/pull-requests" className="block transition-opacity hover:opacity-95">
        <Card className="@container/card cursor-pointer">
          <CardHeader>
            <CardDescription>Merged Pull Requests</CardDescription>
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
            <CardDescription>Open Pull Requests</CardDescription>
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
            <CardDescription>New Issues</CardDescription>
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
            <CardDescription>Closed Issues</CardDescription>
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
