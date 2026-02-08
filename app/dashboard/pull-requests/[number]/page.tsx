"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  NoteIcon,
  CommentDiscussionIcon,
  GitCommitIcon,
  FileDiffIcon,
  CheckCircleIcon,
  DotFillIcon,
  XCircleIcon,
  GitPullRequestIcon,
  GitMergeIcon,
  GitPullRequestClosedIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRepo } from "@/contexts/repo-context"
import { Spinner } from "@/components/ui/spinner"
import GitHubMarkdown from "@/components/githubMarkdown"
import { FileTree, buildFileTree } from "@/components/ui/FileTree"

type PRDetail = {
  number: number
  title: string
  state: string
  body: string | null
  html_url?: string
  user?: { login: string; avatar_url?: string; html_url?: string }
  created_at?: string
  updated_at?: string
  closed_at?: string | null
  merged_at?: string | null
  head?: { sha: string; ref: string }
  base?: { ref: string }
  additions?: number
  deletions?: number
  changed_files?: number
}

type Comment = {
  id: number
  body?: string | null
  user?: { login: string; avatar_url?: string; html_url?: string }
  created_at?: string
  html_url?: string
  /** For review comments: path and line context */
  path?: string
  line?: number
  isReviewComment?: boolean
  /** Review summary (body of a submitted review) */
  isReviewSummary?: boolean
}

type Commit = {
  sha: string
  commit: { message: string; author?: { name?: string; date?: string } }
  html_url?: string
}

type FileItem = {
  filename: string
  status: string
  additions: number
  deletions: number
  patch?: string | null
}

type CheckRun = {
  id: number
  name: string
  status: string
  conclusion: string | null
  html_url?: string
  output?: { title?: string; summary?: string }
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

function ChecksIcon({ conclusion }: { status: string; conclusion: string | null }) {
  if (conclusion === "success") return <CheckCircleIcon size={16} className="text-green-600 shrink-0" />
  if (conclusion === "failure" || conclusion === "cancelled") return <XCircleIcon size={16} className="text-red-600 shrink-0" />
  return <DotFillIcon size={16} className="text-yellow-500 shrink-0" />
}

export default function PRDetailPage() {
  const params = useParams()
  const router = useRouter()
  const number = params?.number as string
  const { repo } = useRepo()
  const { data: session } = useSession()
  const token = session?.accessToken

  const [pr, setPr] = React.useState<PRDetail | null>(null)
  const [comments, setComments] = React.useState<Comment[]>([])
  const [commits, setCommits] = React.useState<Commit[]>([])
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [checks, setChecks] = React.useState<CheckRun[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [refreshing, setRefreshing] = React.useState(false)
  const [selectedFilename, setSelectedFilename] = React.useState<string | null>(null)
  const [currentUserLogin, setCurrentUserLogin] = React.useState<string | null>(
    (session?.user as { login?: string } | undefined)?.login ?? null
  )
  React.useEffect(() => {
    const handler = () => setRefreshKey((k) => k + 1)
    window.addEventListener("tambo-ai-response-complete", handler)
    return () => window.removeEventListener("tambo-ai-response-complete", handler)
  }, [])

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
    const prNum = encodeURIComponent(number)

    fetch(`/api/fetchPRDetail?owner=${owner}&repoName=${repoName}&prNumber=${prNum}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((body: { success?: boolean; data?: PRDetail }) => {
        if (body.success && body.data) setPr(body.data)
        else setError("PR not found")
      })
      .catch(() => setError("Failed to load PR"))
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
    const prNum = encodeURIComponent(number)
    const opts = { headers: { Authorization: `Bearer ${token}` } } as const
    Promise.all([
      fetch(`/api/fetchComments?owner=${owner}&repoName=${repoName}&issueNumber=${issueNum}`, opts).then((res) => res.json()),
      fetch(`/api/fetchPRReviewComments?owner=${owner}&repoName=${repoName}&prNumber=${prNum}`, opts).then((res) => res.json()),
      fetch(`/api/fetchPRReviews?owner=${owner}&repoName=${repoName}&prNumber=${prNum}`, opts).then((res) => res.json()),
    ])
      .then(([issueRes, reviewRes, reviewsRes]) => {
        const issueComments: Comment[] = (issueRes.success && Array.isArray(issueRes.data)) ? issueRes.data : []
        const rawReview = (reviewRes.success && Array.isArray(reviewRes.data)) ? reviewRes.data : [] as Array<{
          id: number
          body?: string | null
          user?: { login: string; avatar_url?: string; html_url?: string }
          created_at?: string
          html_url?: string
          path?: string
          line?: number
          position?: number
        }>
        const reviewComments: Comment[] = rawReview.map((c: (typeof rawReview)[number]) => ({
          id: c.id,
          body: c.body ?? null,
          user: c.user,
          created_at: c.created_at,
          html_url: c.html_url,
          path: c.path,
          line: c.line ?? c.position,
          isReviewComment: true,
        }))
        const rawReviews = (reviewsRes.success && Array.isArray(reviewsRes.data)) ? reviewsRes.data : [] as Array<{
          id: number
          body?: string | null
          user?: { login: string; avatar_url?: string; html_url?: string }
          submitted_at?: string
        }>
        const reviewSummaries: Comment[] = rawReviews
          .filter((r: (typeof rawReviews)[number]) => r.body != null && String(r.body).trim() !== "")
          .map((r: (typeof rawReviews)[number]) => ({
            id: r.id,
            body: r.body ?? null,
            user: r.user,
            created_at: r.submitted_at,
            html_url: undefined,
            isReviewSummary: true,
          }))
        const merged = [...issueComments, ...reviewComments, ...reviewSummaries].sort(
          (a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
        )
        setComments(merged)
      })
      .catch(() => {})
  }, [repo, token, number, refreshKey])

  React.useEffect(() => {
    if (!repo || !token || !number) return
    const owner = encodeURIComponent(repo.owner)
    const repoName = encodeURIComponent(repo.name)
    const prNum = encodeURIComponent(number)
    fetch(`/api/fetchPRCommits?owner=${owner}&repoName=${repoName}&prNumber=${prNum}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((body: { success?: boolean; data?: Commit[] }) => {
        if (body.success && Array.isArray(body.data)) setCommits(body.data)
      })
      .catch(() => {})
  }, [repo, token, number, refreshKey])

  React.useEffect(() => {
    if (!repo || !token || !number) return
    const owner = encodeURIComponent(repo.owner)
    const repoName = encodeURIComponent(repo.name)
    const prNum = encodeURIComponent(number)
    fetch(`/api/fetchPR/fetchFiles?owner=${owner}&repoName=${repoName}&prNumber=${prNum}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((body: { success?: boolean; data?: FileItem[] }) => {
        if (body.success && Array.isArray(body.data)) setFiles(body.data)
      })
      .catch(() => {})
  }, [repo, token, number, refreshKey])

  React.useEffect(() => {
    if (!repo || !token || !pr?.head?.sha) return
    const owner = encodeURIComponent(repo.owner)
    const repoName = encodeURIComponent(repo.name)
    const ref = encodeURIComponent(pr.head.sha)
    fetch(`/api/fetchPRChecks?owner=${owner}&repoName=${repoName}&ref=${ref}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((body: { success?: boolean; data?: CheckRun[] }) => {
        if (body.success && Array.isArray(body.data)) setChecks(body.data)
      })
      .catch(() => {})
  }, [repo, token, pr?.head?.sha, refreshKey])

  const handleRefresh = () => {
    setRefreshing(true)
    setRefreshKey((k) => k + 1)
  }

  if (!repo) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <p className="text-muted-foreground text-center text-sm">Select a repository to view this PR.</p>
        <Button asChild variant="link" className="mt-2">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <p className="text-muted-foreground text-center text-sm">Sign in to view this PR.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-12">
        <Spinner className="size-6" />
        <p className="text-muted-foreground text-sm">Loading pull request…</p>
      </div>
    )
  }

  if (error || !pr) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-destructive text-center text-sm">{error ?? "Pull request not found."}</p>
        <Button variant="outline" onClick={() => router.push("/dashboard/pull-requests")}>
          <ArrowLeftIcon size={16} className="mr-2" />
          Back to Pull Requests
        </Button>
      </div>
    )
  }

  const stateBadge =
    pr.state === "open" ? (
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
    )

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/pull-requests")} aria-label="Back">
          <ArrowLeftIcon size={20} />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-muted-foreground text-sm">#{pr.number}</span>
            {stateBadge}
            {pr.user && (
              <span className="text-muted-foreground text-sm">
                opened by{" "}
                <a
                  href={pr.user.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {pr.user.login}
                </a>
              </span>
            )}
          </div>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">{pr.title}</h1>
          {pr.updated_at && (
            <p className="text-muted-foreground mt-1 text-xs">Updated {formatDate(pr.updated_at)}</p>
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
          {pr.html_url && (
            <Button asChild variant="outline" size="sm">
              <a href={pr.html_url} target="_blank" rel="noopener noreferrer">
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
          <TabsTrigger value="commits" className="flex items-center gap-2">
            <GitCommitIcon size={16} className="text-gray-500" />
            Commits ({commits.length})
          </TabsTrigger>
          <TabsTrigger value="checks" className="flex items-center gap-2">
            <ChecksIcon
              status={checks[0]?.status ?? ""}
              conclusion={checks[0]?.conclusion ?? null}
            />
            Checks ({checks.length})
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileDiffIcon size={16} className="text-gray-500" />
            Files Changed ({files.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
               
               Pull Request Title
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{pr.title}</p>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
               
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pr.body ? (
                <div className="text-inherit [&_p]:mb-1 [&_p:last-child]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_a]:text-primary [&_a]:underline [&_pre]:bg-transparent [&_pre]:border-0 [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:rounded">
                  <GitHubMarkdown content={pr.body} compact simple />
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
              <CardDescription>Comments on this pull request</CardDescription>
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
                        key={c.isReviewSummary ? `s-${c.id}` : c.isReviewComment ? `r-${c.id}` : `i-${c.id}`}
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
                            {c.isReviewSummary && (
                              <Badge variant="secondary" className="text-xs">
                                Review summary
                              </Badge>
                            )}
                            {c.isReviewComment && !c.isReviewSummary && (
                              <Badge variant="secondary" className="text-xs">
                                Review comment
                                {c.path ? ` · ${c.path}${c.line != null ? `:${c.line}` : ""}` : ""}
                              </Badge>
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

        <TabsContent value="commits" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GitCommitIcon size={16} className="text-gray-500" />
                Commits
              </CardTitle>
              <CardDescription>{commits.length} commits in this PR</CardDescription>
            </CardHeader>
            <CardContent>
              {commits.length === 0 ? (
                <p className="text-muted-foreground py-4 text-sm">No commits to show.</p>
              ) : (
                <ul className="space-y-2">
                  {commits.map((c) => (
                    <li key={c.sha} className="flex items-start gap-3 rounded-md border border-border p-3">
                      <GitCommitIcon size={16} className="text-gray-500 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-muted-foreground text-xs">{c.sha.slice(0, 7)}</p>
                        <p className="mt-1 text-sm">{c.commit.message.split("\n")[0]}</p>
                        {c.commit.author && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {c.commit.author.name}
                            {c.commit.author.date && ` · ${formatDate(c.commit.author.date)}`}
                          </p>
                        )}
                      </div>
                      {c.html_url && (
                        <Button asChild variant="ghost" size="sm">
                          <a href={c.html_url} target="_blank" rel="noopener noreferrer">
                            View
                          </a>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ChecksIcon
                  status={checks[0]?.status ?? ""}
                  conclusion={checks[0]?.conclusion ?? null}
                />
                Checks
              </CardTitle>
              <CardDescription>CI / status checks for this PR</CardDescription>
            </CardHeader>
            <CardContent>
              {checks.length === 0 ? (
                <p className="text-muted-foreground py-4 text-sm">No check runs found for this commit.</p>
              ) : (
                <ul className="space-y-2">
                  {checks.map((run) => (
                    <li
                      key={run.id}
                      className="flex items-center gap-3 rounded-md border border-border p-3"
                    >
                      <ChecksIcon status={run.status} conclusion={run.conclusion} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{run.name}</p>
                        {run.output?.title && (
                          <p className="text-muted-foreground text-sm">{run.output.title}</p>
                        )}
                      </div>
                      {run.html_url && (
                        <Button asChild variant="ghost" size="sm">
                          <a href={run.html_url} target="_blank" rel="noopener noreferrer">
                            Details
                          </a>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileDiffIcon size={16} className="text-gray-500" />
                Files Changed
              </CardTitle>
              <CardDescription>
                {files.length} files · +{files.reduce((s, f) => s + f.additions, 0)} / -
                {files.reduce((s, f) => s + f.deletions, 0)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {files.length === 0 ? (
                <p className="text-muted-foreground px-6 py-4 text-sm">No files changed.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,280px)_1fr] gap-0 border-t border-border">
                  <div className="border-r border-border overflow-auto max-h-[60vh] min-h-[200px] p-2">
                    <FileTree
                      items={buildFileTree(files.map((f) => f.filename))}
                      onSelectFile={(path) => setSelectedFilename(path)}
                      selectedPath={selectedFilename}
                      fileStats={Object.fromEntries(
                        files.map((f) => [f.filename, { additions: f.additions, deletions: f.deletions }])
                      )}
                      embedded
                    />
                  </div>
                  <div className="overflow-auto max-h-[60vh] min-h-[200px] bg-[#f0fdf4] dark:bg-green-950/20">
                    {selectedFilename ? (
                      (() => {
                        const file = files.find((f) => f.filename === selectedFilename)
                        const patch = file?.patch
                        return (
                          <div className="p-4">
                            <p className="font-mono text-sm text-muted-foreground mb-2 border-b border-border pb-2">
                              {selectedFilename}
                              {file && (
                                <span className="ml-2">
                                  <Badge variant="secondary" className="text-xs">{file.status}</Badge>
                                  <span className="text-green-600 ml-1">+{file.additions}</span>
                                  <span className="text-red-600">-{file.deletions}</span>
                                </span>
                              )}
                            </p>
                            {patch ? (
                              <pre className="text-xs font-mono whitespace-pre overflow-x-auto rounded border border-border bg-[#f0fdf4] dark:bg-green-950/30 p-3">
                                <code className="text-foreground">{patch}</code>
                              </pre>
                            ) : (
                              <p className="text-muted-foreground text-sm">No diff content for this file.</p>
                            )}
                          </div>
                        )
                      })()
                    ) : (
                      <div className="flex h-full min-h-[200px] items-center justify-center text-muted-foreground text-sm">
                        Select a file to view its diff
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
