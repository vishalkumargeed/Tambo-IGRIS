"use client"

import * as React from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

import {
  GitPullRequestIcon,
  GitMergeIcon,
  GitPullRequestClosedIcon,
  SyncIcon,
} from "@primer/octicons-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRepo } from "@/contexts/repo-context"
import { Spinner } from "@/components/ui/spinner"
import {
  type ReadyForReviewValue,
  getReadyForReviewOverride,
} from "@/lib/pr-ready-for-review"

export { setReadyForReview } from "@/lib/pr-ready-for-review"
export type { ReadyForReviewValue } from "@/lib/pr-ready-for-review"

type PRItem = {
  number: number
  title: string
  state: string
  html_url?: string
  user?: { login: string; avatar_url?: string; html_url?: string }
  created_at?: string
  updated_at?: string
  closed_at?: string | null
  merged_at?: string | null
  labels?: Array<{ name?: string }>
}

function getReadyForReview(
  pr: PRItem,
  owner: string,
  repoName: string,
  apiReadyStatus?: boolean | null
): ReadyForReviewValue {
  const override = getReadyForReviewOverride(owner, repoName, pr.number)
  if (override) return override
  if (pr.merged_at) return "Done"
  if (pr.state === "closed") return "Not Ready"
  // When all checks pass AND PR aligns to template, show Ready
  if (apiReadyStatus === true) return "Ready"
  const labelNames = (pr.labels ?? []).map((l) => (l.name ?? "").toLowerCase())
  if (
    labelNames.some(
      (n) => n === "in-progress" || n === "in process" || n.includes("in progress")
    )
  ) {
    return "In Process"
  }
  if (
    labelNames.some(
      (n) => n === "ready" || n === "ready-for-review" || n.includes("ready")
    )
  ) {
    return "Ready"
  }
  return "Not Ready"
}

function ReadyForReviewBadge({ value }: { value: ReadyForReviewValue }) {
  switch (value) {
    case "Ready":
      return (
        <Badge className="text-green-600 bg-[#3fb950]/15 hover:bg-[#3fb950]/25 border-0">
          Ready
        </Badge>
      )
    case "In Process":
      return (
        <Badge className="text-yellow-600 bg-[#d4a72c]/15 hover:bg-[#d4a72c]/25 border-0">
          In Process
        </Badge>
      )
    case "Done":
      return (
        <Badge className="text-purple-600 bg-[#8250df]/15 hover:bg-[#8250df]/25 border-0">
          Done
        </Badge>
      )
    case "Not Ready":
      return (
        <Badge className="text-red-600 bg-[#f85149]/15 hover:bg-[#f85149]/25 border-0">
          Not Ready
        </Badge>
      )
  }
}

function formatRelative(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const sec = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (sec < 60) return "just now"
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
    if (sec < 86400 * 7) return `${Math.floor(sec / 86400)}d ago`
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  } catch {
    return iso
  }
}

function PRsTable({
  prs,
  emptyLabel = "No pull requests in this state.",
  owner,
  repoName,
  prReadyStatusMap,
  selectedNumbers,
  onSelectionChange,
  tabType,
}: {
  prs: PRItem[]
  emptyLabel?: string
  owner: string
  repoName: string
  prReadyStatusMap?: Record<number, { ready: boolean } | null>
  selectedNumbers?: Set<number>
  onSelectionChange?: (numbers: Set<number>) => void
  tabType?: "open" | "merged" | "closed"
}) {
  const canSelect = !!onSelectionChange && !!selectedNumbers
  const selectable = tabType === "open" || tabType === "closed"
  const allSelected = canSelect && selectable && prs.length > 0 && prs.every((p) => selectedNumbers.has(p.number))
  const someSelected = canSelect && selectable && prs.some((p) => selectedNumbers.has(p.number))

  const handleToggleAll = () => {
    if (!onSelectionChange || !selectedNumbers) return
    const next = new Set(selectedNumbers)
    if (allSelected) prs.forEach((p) => next.delete(p.number))
    else prs.forEach((p) => next.add(p.number))
    onSelectionChange(next)
  }

  const handleToggleOne = (num: number) => {
    if (!onSelectionChange || !selectedNumbers) return
    const next = new Set(selectedNumbers)
    if (next.has(num)) next.delete(num)
    else next.add(num)
    onSelectionChange(next)
  }

  if (prs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
        <p className="text-muted-foreground/80 text-xs">
          Try changing the tab, filters, or repository.
        </p>
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {canSelect && selectable && (
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleToggleAll}
                aria-label="Select all"
              />
            </TableHead>
          )}
          <TableHead className="w-16">#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="w-24">State</TableHead>
          <TableHead className="w-32">Review</TableHead>
          <TableHead className="w-40">Author</TableHead>
          <TableHead className="w-32 text-right">Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prs.map((pr) => (
          <TableRow key={pr.number}>
            {canSelect && selectable && (
              <TableCell>
                <Checkbox
                  checked={selectedNumbers!.has(pr.number)}
                  onCheckedChange={() => handleToggleOne(pr.number)}
                  aria-label={`Select PR #${pr.number}`}
                />
              </TableCell>
            )}
            <TableCell className="font-mono text-muted-foreground">
              {pr.number}
            </TableCell>
            <TableCell>
              <Link
                href={`/dashboard/pull-requests/${pr.number}?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repoName)}`}
                className="font-medium hover:underline"
              >
                {pr.title}
              </Link>
            </TableCell>
            <TableCell>
              {pr.state === "open" ? (
                <Badge className="text-green-600 bg-[#3fb950]/15 hover:bg-[#3fb950]/25 border-0 gap-1">
                  <GitPullRequestIcon size={14} />
                  Open
                </Badge>
              ) : pr.merged_at ? (
                <Badge className="text-purple-600 bg-[#8250df]/15 hover:bg-[#8250df]/25 border-0 gap-1">
                  <GitMergeIcon size={14} />
                  Merged
                </Badge>
              ) : (
                <Badge className="text-purple-600 bg-[#8250df]/15 hover:bg-[#8250df]/25 border-0 gap-1">
                  <GitPullRequestClosedIcon size={14} />
                  Closed
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <ReadyForReviewBadge
                value={getReadyForReview(
                  pr,
                  owner,
                  repoName,
                  prReadyStatusMap?.[pr.number]?.ready ?? undefined
                )}
              />
            </TableCell>
            <TableCell>
              {pr.user ? (
                <a
                  href={pr.user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <Avatar className="size-6">
                    <AvatarImage src={pr.user.avatar_url} alt="" />
                    <AvatarFallback className="text-xs">
                      {pr.user.login.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{pr.user.login}</span>
                </a>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-right text-muted-foreground text-sm">
              {pr.updated_at
                ? formatRelative(pr.updated_at)
                : pr.created_at
                  ? formatRelative(pr.created_at)
                  : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function filterPRs(
  prs: PRItem[],
  owner: string,
  repoName: string,
  readyFilter: ReadyForReviewValue | "all",
  authorFilter: string,
  prReadyStatusMap?: Record<number, { ready: boolean } | null>
): PRItem[] {
  return prs.filter((pr) => {
    if (readyFilter !== "all") {
      if (
        getReadyForReview(
          pr,
          owner,
          repoName,
          prReadyStatusMap?.[pr.number]?.ready ?? undefined
        ) !== readyFilter
      )
        return false
    }
    if (authorFilter && pr.user?.login !== authorFilter) return false
    return true
  })
}

function AuthorFilterSelect({
  openPRs,
  mergedPRs,
  closedOnlyPRs,
  value,
  onValueChange,
  tabValue,
}: {
  openPRs: PRItem[]
  mergedPRs: PRItem[]
  closedOnlyPRs: PRItem[]
  value: string
  onValueChange: (v: string) => void
  tabValue: string
}) {
  const prs =
    tabValue === "open"
      ? openPRs
      : tabValue === "merged"
        ? mergedPRs
        : closedOnlyPRs
  const authors = React.useMemo(() => {
    const logins = new Set<string>()
    prs.forEach((pr) => {
      if (pr.user?.login) logins.add(pr.user.login)
    })
    return Array.from(logins).sort()
  }, [prs])
  return (
    <Select value={value || "all"} onValueChange={(v) => onValueChange(v === "all" ? "" : v)}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="All authors" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All authors</SelectItem>
        {authors.map((login) => (
          <SelectItem key={login} value={login}>
            {login}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function DashboardPullRequestsPage() {
  const { repo } = useRepo()
  const { data: session } = useSession()
  const token = session?.accessToken
  const [openPRs, setOpenPRs] = React.useState<PRItem[]>([])
  const [closedPRs, setClosedPRs] = React.useState<PRItem[]>([])
  const [mergedPRs, setMergedPRs] = React.useState<PRItem[]>([])
  const [closedOnlyPRs, setClosedOnlyPRs] = React.useState<PRItem[]>([])
  const [loadingOpen, setLoadingOpen] = React.useState(true)
  const [loadingClosed, setLoadingClosed] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [readyForReviewFilter, setReadyForReviewFilter] = React.useState<
    ReadyForReviewValue | "all"
  >("all")
  const [authorFilter, setAuthorFilter] = React.useState<string>("")
  const [tabValue, setTabValue] = React.useState<string>("open")
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [refreshing, setRefreshing] = React.useState(false)
  const [prReadyStatusMap, setPrReadyStatusMap] = React.useState<
    Record<number, { ready: boolean } | null>
  >({})
  const [selectedPRs, setSelectedPRs] = React.useState<Set<number>>(new Set())
  const [actionLoading, setActionLoading] = React.useState(false)
  const [actionError, setActionError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1)
    window.addEventListener("pr-ready-for-review-updated", handler)
    window.addEventListener("tambo-ai-response-complete", handler)
    return () => {
      window.removeEventListener("pr-ready-for-review-updated", handler)
      window.removeEventListener("tambo-ai-response-complete", handler)
    }
  }, [])

  React.useEffect(() => {
    if (!repo || !token) {
      setOpenPRs([])
      setClosedPRs([])
      setMergedPRs([])
      setClosedOnlyPRs([])
      setLoadingOpen(false)
      setLoadingClosed(false)
      return
    }
    setError(null)
    setLoadingOpen(true)
    fetch(
      `/api/fetchPR?owner=${encodeURIComponent(repo.owner)}&repoName=${encodeURIComponent(repo.name)}&state=open`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => res.json())
      .then((body: { success?: boolean; data?: PRItem[] }) => {
        if (body.success && Array.isArray(body.data)) setOpenPRs(body.data)
        else setOpenPRs([])
      })
      .catch(() => setError("Failed to load open PRs"))
      .finally(() => setLoadingOpen(false))

    setLoadingClosed(true)
    fetch(
      `/api/fetchPR?owner=${encodeURIComponent(repo.owner)}&repoName=${encodeURIComponent(repo.name)}&state=closed`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => res.json())
      .then((body: { success?: boolean; data?: PRItem[] }) => {
        if (body.success && Array.isArray(body.data)) {
          const closed = body.data
          setClosedPRs(closed)
          setMergedPRs(closed.filter((pr) => pr.merged_at))
          setClosedOnlyPRs(closed.filter((pr) => !pr.merged_at))
        } else {
          setClosedPRs([])
          setMergedPRs([])
          setClosedOnlyPRs([])
        }
      })
      .catch(() => {
        setError("Failed to load closed PRs")
        setClosedPRs([])
        setMergedPRs([])
        setClosedOnlyPRs([])
      })
      .finally(() => setLoadingClosed(false))
  }, [repo, token, refreshKey])

  // Fetch ready status (checks + template) for each open PR to auto-set Review column to Ready
  React.useEffect(() => {
    if (!repo || !token || openPRs.length === 0) return
    const owner = encodeURIComponent(repo.owner)
    const repoName = encodeURIComponent(repo.name)
    const opts = { headers: { Authorization: `Bearer ${token}` } }
    const fetchOne = (pr: PRItem) =>
      fetch(
        `/api/prReadyStatus?owner=${owner}&repoName=${repoName}&prNumber=${pr.number}`,
        opts
      )
        .then((res) => res.json())
        .then((body: { success?: boolean; ready?: boolean }) => ({
          number: pr.number,
          ready: body.success === true && body.ready === true,
        }))
        .catch(() => ({ number: pr.number, ready: false }))
    Promise.all(openPRs.map(fetchOne)).then((results) => {
      setPrReadyStatusMap((prev) => {
        const next = { ...prev }
        for (const r of results) {
          next[r.number] = { ready: r.ready }
        }
        return next
      })
    })
  }, [repo, token, openPRs, refreshKey])

  React.useEffect(() => {
    if (!loadingOpen && !loadingClosed) setRefreshing(false)
  }, [loadingOpen, loadingClosed])

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshKey((k) => k + 1)
  }

  const performBulkAction = async (action: "merge" | "close" | "reopen") => {
    if (!repo || !token || selectedPRs.size === 0 || actionLoading) return
    setActionError(null)
    setActionLoading(true)
    const numbers = Array.from(selectedPRs)
    const errors: string[] = []
    for (const prNumber of numbers) {
      try {
        const res = await fetch("/api/prActions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            owner: repo.owner,
            repoName: repo.name,
            prNumber,
            action,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          errors.push(`#${prNumber}: ${data.message ?? data.error ?? "Failed"}`)
        }
      } catch {
        errors.push(`#${prNumber}: Network error`)
      }
    }
    setActionLoading(false)
    if (errors.length > 0) {
      setActionError(errors.slice(0, 3).join("; ") + (errors.length > 3 ? "…" : ""))
    } else {
      setSelectedPRs(new Set())
      setRefreshKey((k) => k + 1)
    }
  }

  React.useEffect(() => {
    setSelectedPRs(new Set())
    setActionError(null)
  }, [tabValue])

  const selectedOpen = React.useMemo(() => {
    return openPRs.filter((p) => selectedPRs.has(p.number))
  }, [openPRs, selectedPRs])
  const selectedClosedOnly = React.useMemo(() => {
    return closedOnlyPRs.filter((p) => selectedPRs.has(p.number))
  }, [closedOnlyPRs, selectedPRs])
  const showMergeClose = tabValue === "open" && selectedOpen.length > 0
  const showReopen = tabValue === "closed" && selectedClosedOnly.length > 0

  if (!repo) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <p className="text-muted-foreground text-center text-sm">
          Select a repository from the header to view pull requests.
        </p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <p className="text-muted-foreground text-center text-sm">
          Sign in to view pull requests.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Pull Requests</CardTitle>
              <CardDescription>
                Open, merged, and closed pull requests for {repo.fullName}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing || loadingOpen || loadingClosed}
              aria-label="Refresh"
            >
              <SyncIcon size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-destructive mb-4 text-sm">{error}</p>
          )}
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Ready for Review</span>
              <Select
                value={readyForReviewFilter}
                onValueChange={(v) =>
                  setReadyForReviewFilter(v as ReadyForReviewValue | "all")
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Ready">Ready</SelectItem>
                  <SelectItem value="In Process">In Process</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                  <SelectItem value="Not Ready">Not Ready</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Author</span>
              <AuthorFilterSelect
                openPRs={openPRs}
                mergedPRs={mergedPRs}
                closedOnlyPRs={closedOnlyPRs}
                value={authorFilter}
                onValueChange={setAuthorFilter}
                tabValue={tabValue}
              />
            </div>
          </div>
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsList>
              <TabsTrigger value="open">
                Open {loadingOpen ? <Spinner className="ml-1 inline size-3" /> : `(${openPRs.length})`}
              </TabsTrigger>
              <TabsTrigger value="merged">
                Merged {loadingClosed ? <Spinner className="ml-1 inline size-3" /> : `(${mergedPRs.length})`}
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed {loadingClosed ? <Spinner className="ml-1 inline size-3" /> : `(${closedOnlyPRs.length})`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="mt-4">
              {loadingOpen ? (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
                  <Spinner className="size-4" />
                  <span>Loading open PRs…</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {showMergeClose && (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                      <span className="text-muted-foreground text-sm">
                        {selectedOpen.length} PR{selectedOpen.length !== 1 ? "s" : ""} selected
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading}
                        onClick={() => performBulkAction("merge")}
                      >
                        {actionLoading ? <Spinner className="mr-2 size-3.5" /> : <GitMergeIcon size={14} className="mr-2 text-green-600" />}
                        Merge
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading}
                        onClick={() => performBulkAction("close")}
                        className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                      >
                        <GitPullRequestClosedIcon size={14} className="mr-2 text-red-600" />
                        Close
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedPRs(new Set())}
                        className="hover:bg-muted"
                      >
                        Clear selection
                      </Button>
                      {actionError && (
                        <p className="text-destructive text-xs">{actionError}</p>
                      )}
                    </div>
                  )}
                  <div className="rounded-lg border border-border">
                    <PRsTable
                      prs={filterPRs(
                      openPRs,
                      repo.owner,
                      repo.name,
                      readyForReviewFilter,
                      authorFilter,
                      prReadyStatusMap
                    )}
                      emptyLabel="No open pull requests."
                      owner={repo.owner}
                      repoName={repo.name}
                      prReadyStatusMap={prReadyStatusMap}
                      selectedNumbers={selectedPRs}
                      onSelectionChange={setSelectedPRs}
                      tabType="open"
                    />
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="merged" className="mt-4">
              {loadingClosed ? (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
                  <Spinner className="size-4" />
                  <span>Loading merged PRs…</span>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-[#8250df]/5">
                  <PRsTable
                    prs={filterPRs(
                      mergedPRs,
                      repo.owner,
                      repo.name,
                      readyForReviewFilter,
                      authorFilter,
                      prReadyStatusMap
                    )}
                    emptyLabel="No merged pull requests."
                    owner={repo.owner}
                    repoName={repo.name}
                    prReadyStatusMap={prReadyStatusMap}
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="closed" className="mt-4">
              {loadingClosed ? (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
                  <Spinner className="size-4" />
                  <span>Loading closed PRs…</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {showReopen && (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
                      <span className="text-muted-foreground text-sm">
                        {selectedClosedOnly.length} PR{selectedClosedOnly.length !== 1 ? "s" : ""} selected
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading}
                        onClick={() => performBulkAction("reopen")}
                      >
                        {actionLoading ? <Spinner className="mr-2 size-3.5" /> : <GitPullRequestIcon size={14} className="mr-2 text-green-600" />}
                        Reopen
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedPRs(new Set())}
                        className="hover:bg-muted"
                      >
                        Clear selection
                      </Button>
                      {actionError && (
                        <p className="text-destructive text-xs">{actionError}</p>
                      )}
                    </div>
                  )}
                  <div className="rounded-lg border border-border bg-muted/30">
                    <PRsTable
                      prs={filterPRs(
                        closedOnlyPRs,
                        repo.owner,
                        repo.name,
                        readyForReviewFilter,
                        authorFilter,
                        prReadyStatusMap
                      )}
                      emptyLabel="No closed pull requests."
                      owner={repo.owner}
                      repoName={repo.name}
                      prReadyStatusMap={prReadyStatusMap}
                      selectedNumbers={selectedPRs}
                      onSelectionChange={setSelectedPRs}
                      tabType="closed"
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
