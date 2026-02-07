"use client"

import * as React from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

import {
  IssueOpenedIcon,
  IssueClosedIcon,
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
  }, [repo, token])

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
          <CardTitle>Issues</CardTitle>
          <CardDescription>
            Open and closed issues for {repo.fullName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-destructive mb-4 text-sm">{error}</p>
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
