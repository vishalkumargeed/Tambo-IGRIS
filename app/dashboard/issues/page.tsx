"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import {
  IssueOpenedIcon,
  IssueClosedIcon,
  PlusIcon,
  SyncIcon,
} from "@primer/octicons-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

type IssueItem = {
  number: number
  title: string
  state: string
  html_url?: string
  user?: { login: string; avatar_url?: string; html_url?: string }
  created_at?: string
  updated_at?: string
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

function IssuesTable({
  issues,
  emptyLabel = "No issues in this state.",
  owner,
  repoName,
}: {
  issues: IssueItem[]
  emptyLabel?: string
  owner: string
  repoName: string
}) {
  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-muted-foreground text-sm">{emptyLabel}</p>
        <p className="text-muted-foreground/80 text-xs">
          Try changing the tab or repository.
        </p>
      </div>
    )
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="w-24">State</TableHead>
          <TableHead className="w-40">Author</TableHead>
          <TableHead className="w-32 text-right">Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {issues.map((issue) => (
          <TableRow key={issue.number}>
            <TableCell className="font-mono text-muted-foreground">
              {issue.number}
            </TableCell>
            <TableCell>
              <Link
                href={`/dashboard/issues/${issue.number}?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repoName)}`}
                className="font-medium hover:underline"
              >
                {issue.title}
              </Link>
            </TableCell>
            <TableCell>
              <Badge
                variant={issue.state === "open" ? "default" : "secondary"}
                className={
                  issue.state === "open"
                    ? "text-green-600 bg-[#3fb950]/15 hover:bg-[#3fb950]/25 border-0 gap-1"
                    : "text-purple-600 bg-[#8250df]/15 hover:bg-[#8250df]/25 border-0 gap-1"
                }
              >
                {issue.state === "open" ? (
                  <>
                    <IssueOpenedIcon size={14} />
                    Open
                  </>
                ) : (
                  <>
                    <IssueClosedIcon size={14} />
                    Closed
                  </>
                )}
              </Badge>
            </TableCell>
            <TableCell>
              {issue.user ? (
                <a
                  href={issue.user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <Avatar className="size-6">
                    <AvatarImage src={issue.user.avatar_url} alt="" />
                    <AvatarFallback className="text-xs">
                      {issue.user.login.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{issue.user.login}</span>
                </a>
              ) : (
                "—"
              )}
            </TableCell>
            <TableCell className="text-right text-muted-foreground text-sm">
              {issue.updated_at
                ? formatRelative(issue.updated_at)
                : issue.created_at
                  ? formatRelative(issue.created_at)
                  : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function DashboardIssuesPage() {
  const { repo } = useRepo()
  const { data: session } = useSession()
  const token = session?.accessToken
  const [openIssues, setOpenIssues] = React.useState<IssueItem[]>([])
  const [closedIssues, setClosedIssues] = React.useState<IssueItem[]>([])
  const [loadingOpen, setLoadingOpen] = React.useState(true)
  const [loadingClosed, setLoadingClosed] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [refreshing, setRefreshing] = React.useState(false)
  const [newIssueOpen, setNewIssueOpen] = React.useState(false)
  const [newIssueTitle, setNewIssueTitle] = React.useState("")
  const [newIssueBody, setNewIssueBody] = React.useState("")
  const [newIssueSubmitting, setNewIssueSubmitting] = React.useState(false)
  const [newIssueError, setNewIssueError] = React.useState<string | null>(null)
  const router = useRouter()

  React.useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1)
    window.addEventListener("tambo-ai-response-complete", handler)
    return () => window.removeEventListener("tambo-ai-response-complete", handler)
  }, [])

  React.useEffect(() => {
    if (!repo || !token) {
      setOpenIssues([])
      setClosedIssues([])
      setLoadingOpen(false)
      setLoadingClosed(false)
      return
    }
    setError(null)
    setLoadingOpen(true)
    fetch(
      `/api/fetchIssues?owner=${encodeURIComponent(repo.owner)}&repoName=${encodeURIComponent(repo.name)}&state=open`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => res.json())
      .then((body: { success?: boolean; data?: IssueItem[] }) => {
        if (body.success && Array.isArray(body.data)) setOpenIssues(body.data)
        else setOpenIssues([])
      })
      .catch(() => setError("Failed to load open issues"))
      .finally(() => setLoadingOpen(false))

    setLoadingClosed(true)
    fetch(
      `/api/fetchIssues?owner=${encodeURIComponent(repo.owner)}&repoName=${encodeURIComponent(repo.name)}&state=closed`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((res) => res.json())
      .then((body: { success?: boolean; data?: IssueItem[] }) => {
        if (body.success && Array.isArray(body.data)) setClosedIssues(body.data)
        else setClosedIssues([])
      })
      .catch(() => setError("Failed to load closed issues"))
      .finally(() => setLoadingClosed(false))
  }, [repo, token, refreshKey])

  React.useEffect(() => {
    if (!loadingOpen && !loadingClosed) setRefreshing(false)
  }, [loadingOpen, loadingClosed])

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshKey((k) => k + 1)
  }

  const handleCreateIssue = async () => {
    if (!repo || !token || !newIssueTitle.trim() || newIssueSubmitting) return
    setNewIssueError(null)
    setNewIssueSubmitting(true)
    try {
      const res = await fetch("/api/createIssue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          owner: repo.owner,
          repoName: repo.name,
          title: newIssueTitle.trim(),
          body: newIssueBody.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setNewIssueError(data.message ?? data.error ?? "Failed to create issue")
        return
      }
      const issue = data.data
      setNewIssueOpen(false)
      setNewIssueTitle("")
      setNewIssueBody("")
      setRefreshKey((k) => k + 1)
      if (issue?.number != null) {
        router.push(
          `/dashboard/issues/${issue.number}?owner=${encodeURIComponent(repo.owner)}&repo=${encodeURIComponent(repo.name)}`
        )
      }
    } catch {
      setNewIssueError("Failed to create issue")
    } finally {
      setNewIssueSubmitting(false)
    }
  }

  if (!repo) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <p className="text-muted-foreground text-center text-sm">
          Select a repository from the header to view issues.
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
          Sign in to view issues.
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
              <CardTitle>Issues</CardTitle>
              <CardDescription>
                Open and closed issues for {repo.fullName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
            
              <Button onClick={() => setNewIssueOpen(true)}>
                <PlusIcon size={16} className="mr-2" />
                New issue
              </Button>
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
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-destructive mb-4 text-sm">{error}</p>
          )}
          {newIssueOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-issue-title"
            >
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => !newIssueSubmitting && setNewIssueOpen(false)}
                aria-hidden="true"
              />
              <Card
                className="relative z-10 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader>
                  <CardTitle id="new-issue-title">New issue</CardTitle>
                  <CardDescription>
                    Create a new issue in {repo.fullName}. Title is required.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-issue-title-input">Title</Label>
                    <Input
                      id="new-issue-title-input"
                      placeholder="Issue title"
                      value={newIssueTitle}
                      onChange={(e) => setNewIssueTitle(e.target.value)}
                      disabled={newIssueSubmitting}
                      className="focus-visible:border-muted-foreground/50 focus-visible:ring-muted-foreground/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-issue-body">Description (optional)</Label>
                    <textarea
                      id="new-issue-body"
                      placeholder="Add a description…"
                      value={newIssueBody}
                      onChange={(e) => setNewIssueBody(e.target.value)}
                      disabled={newIssueSubmitting}
                      rows={6}
                      className="border-input bg-background placeholder:text-muted-foreground flex w-full min-w-0 rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus:border-muted-foreground/50 focus:ring-2 focus:ring-muted-foreground/20 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50"
                    />
                  </div>
                  {newIssueError && (
                    <p className="text-destructive text-sm">{newIssueError}</p>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setNewIssueOpen(false)}
                    disabled={newIssueSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateIssue}
                    disabled={!newIssueTitle.trim() || newIssueSubmitting}
                  >
                    {newIssueSubmitting ? (
                      <>
                        <Spinner className="mr-2 size-3.5" />
                        Creating…
                      </>
                    ) : (
                      "Create issue"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          <Tabs defaultValue="open">
            <TabsList>
              <TabsTrigger value="open">
                Open {loadingOpen ? <Spinner className="ml-1 inline size-3" /> : `(${openIssues.length})`}
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed {loadingClosed ? <Spinner className="ml-1 inline size-3" /> : `(${closedIssues.length})`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="mt-4">
              {loadingOpen ? (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
                  <Spinner className="size-4" />
                  <span>Loading open issues…</span>
                </div>
              ) : (
                <div className="rounded-lg border border-border">
                  <IssuesTable
                    issues={openIssues}
                    emptyLabel="No open issues."
                    owner={repo.owner}
                    repoName={repo.name}
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="closed" className="mt-4">
              {loadingClosed ? (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-sm">
                  <Spinner className="size-4" />
                  <span>Loading closed issues…</span>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted/30">
                  <IssuesTable
                    issues={closedIssues}
                    emptyLabel="No closed issues."
                    owner={repo.owner}
                    repoName={repo.name}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
