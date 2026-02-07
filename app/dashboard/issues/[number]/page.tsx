"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  PencilIcon,
  NoteIcon,
  CommentDiscussionIcon,
  IssueOpenedIcon,
  IssueClosedIcon,
  ArrowLeftIcon,
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
import GitHubMarkdown from "@/components/githubMarkdown"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRepo } from "@/contexts/repo-context"
import { Spinner } from "@/components/ui/spinner"


type IssueDetail = {
  number: number
  title: string
  state: string
  body: string | null
  html_url?: string
  user?: { login: string; avatar_url?: string; html_url?: string }
  created_at?: string
  updated_at?: string
  closed_at?: string | null
  labels?: Array<{ name?: string; color?: string }>
}

type Comment = {
  id: number
  body?: string | null
  user?: { login: string; avatar_url?: string; html_url?: string }
  created_at?: string
  html_url?: string
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

export default function IssueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const number = params?.number as string
  const { repo } = useRepo()
  const { data: session } = useSession()
  const token = session?.accessToken

  const [issue, setIssue] = React.useState<IssueDetail | null>(null)
  const [comments, setComments] = React.useState<Comment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [refreshing, setRefreshing] = React.useState(false)
  const [currentUserLogin, setCurrentUserLogin] = React.useState<string | null>(
    (session?.user as { login?: string } | undefined)?.login ?? null
  )
  React.useEffect(() => {
    const fromSession = (session?.user as { login?: string } | undefined)?.login
    if (fromSession) {
      setCurrentUserLogin(fromSession)
      return
    }
    if (!token) return
    fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((body: { success?: boolean; login?: string }) => {
        if (body.success && body.login) setCurrentUserLogin(body.login)
      })
      .catch(() => {})
  }, [session?.user, token])

  React.useEffect(() => {
    if (!repo || !token || !number) {
      setLoading(false)
      return
    }
    setError(null)
    setLoading(true)
    const owner = encodeURIComponent(repo.owner)
    const repoName = encodeURIComponent(repo.name)
    const issueNum = encodeURIComponent(number)

    fetch(`/api/fetchIssueDetail?owner=${owner}&repoName=${repoName}&issueNumber=${issueNum}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((body: { success?: boolean; data?: IssueDetail }) => {
        if (body.success && body.data) setIssue(body.data)
        else setError("Issue not found")
      })
      .catch(() => setError("Failed to load issue"))
      .finally(() => {
        setLoading(false)
        setRefreshing(false)
      })
  }, [repo, token, number, refreshKey])

  React.useEffect(() => {
    if (!repo || !token || !number) return
    const owner = encodeURIComponent(repo.owner)
    const repoName = encodeURIComponent(repo.name)
    const issueNum = encodeURIComponent(number)
    fetch(`/api/fetchComments?owner=${owner}&repoName=${repoName}&issueNumber=${issueNum}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((body: { success?: boolean; data?: Comment[] }) => {
        if (body.success && Array.isArray(body.data)) setComments(body.data)
      })
      .catch(() => {})
  }, [repo, token, number, refreshKey])

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshKey((k) => k + 1)
  }

  if (!repo) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <p className="text-muted-foreground text-center text-sm">Select a repository to view this issue.</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <p className="text-muted-foreground text-center text-sm">Sign in to view this issue.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-12">
        <Spinner className="size-6" />
        <p className="text-muted-foreground text-sm">Loading issue…</p>
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-destructive text-center text-sm">{error ?? "Issue not found."}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/issues")}>
          <ArrowLeftIcon size={16} className="mr-2" />
          Back to Issues
        </Button>
      </div>
    )
  }

  const stateBadge =
    issue.state === "open" ? (
      <Badge className="text-green-600 bg-[#3fb950]/15 hover:bg-[#3fb950]/25 border-0 gap-1">
        <IssueOpenedIcon size={14} />
        Open
      </Badge>
    ) : (
      <Badge className="text-purple-600 bg-[#8250df]/15 hover:bg-[#8250df]/25 border-0 gap-1">
        <IssueClosedIcon size={14} />
        Closed
      </Badge>
    )

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/issues")} aria-label="Back">
          <ArrowLeftIcon size={20} />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-muted-foreground text-sm">#{issue.number}</span>
            {stateBadge}
            {issue.labels && issue.labels.length > 0 && (
              <>
                {issue.labels.map((l) => (
                  <Badge
                    key={l.name}
                    variant="secondary"
                    className="text-xs"
                    style={l.color ? { borderColor: `#${l.color}`, color: `#${l.color}` } : undefined}
                  >
                    {l.name}
                  </Badge>
                ))}
              </>
            )}
            {issue.user && (
              <span className="text-muted-foreground text-sm">
                opened by{" "}
                <a
                  href={issue.user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {issue.user.login}
                </a>
              </span>
            )}
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">{issue.title}</h1>
          {issue.updated_at && (
            <p className="text-muted-foreground mt-1 text-xs">Updated {formatDate(issue.updated_at)}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh"
          >
            <SyncIcon size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
          {issue.html_url && (
            <Button asChild variant="outline" size="sm">
              <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="description" className="w-full">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="description" className="flex items-center gap-2">
            <NoteIcon size={16} className="text-gray-500" />
            Description
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <CommentDiscussionIcon size={16} className="text-gray-500" />
            Conversations ({comments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PencilIcon size={16} className="text-gray-500" />
                Title
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{issue.title}</p>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <NoteIcon size={16} className="text-gray-500" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {issue.body ? (
                <div className="text-inherit [&_p]:mb-1 [&_p:last-child]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_a]:text-primary [&_a]:underline [&_pre]:bg-transparent [&_pre]:border-0 [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:rounded">
                  <GitHubMarkdown content={issue.body} compact simple />
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No description provided.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CommentDiscussionIcon size={16} className="text-gray-500" />
                Conversations
              </CardTitle>
              <CardDescription>Comments on this issue</CardDescription>
            </CardHeader>
            <CardContent>
              {comments.length === 0 ? (
                <p className="text-muted-foreground py-4 text-sm">No comments yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {comments.map((c) => {
                    const isMe = currentUserLogin != null && c.user?.login != null && c.user.login.toLowerCase() === currentUserLogin.toLowerCase()
                    return (
                      <div
                        key={c.id}
                        className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                      >
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage src={c.user?.avatar_url} alt="" />
                          <AvatarFallback>{c.user?.login?.slice(0, 2) ?? "?"}</AvatarFallback>
                        </Avatar>
                        <div className={`flex min-w-0 max-w-[85%] flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-sm">{c.user?.login ?? "Unknown"}</span>
                            {c.created_at && (
                              <span className="text-muted-foreground text-xs">
                                {formatDate(c.created_at)}
                              </span>
                            )}
                          </div>
                          <div
                            className={`mt-1 rounded-2xl px-3 py-2 text-sm wrap-break-word prose prose-sm max-w-none dark:prose-invert [&_pre]:bg-transparent [&_pre]:border-0 [&_pre]:p-0 [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-3 [&_blockquote]:italic [&_.markdown-body]:p-0 [&_.markdown-body]:bg-transparent ${
                              isMe ? "bg-muted/60 rounded-tr-sm" : "bg-muted/60 rounded-tl-sm"
                            }`}
                          >
                            {c.body?.trim() ? (
                              <GitHubMarkdown content={c.body} compact simple />
                            ) : (
                              "—"
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
