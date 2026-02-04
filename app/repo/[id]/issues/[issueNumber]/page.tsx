import { auth } from "@/auth"
import Link from "next/link"

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

type IssueDetail = {
  number: number
  title: string
  body: string | null
  state: string
  html_url: string
  created_at: string
  updated_at: string
  closed_at: string | null
  user: { login: string; avatar_url: string; html_url: string }
  comments: number
  labels: Array<{ name: string; color: string; description?: string | null }>
  assignees: Array<{ login: string; avatar_url: string; html_url: string }>
  milestone?: { title: string; state: string; html_url?: string } | null
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

function stateBadge(state: string) {
  const isOpen = state === "open"
  const label = isOpen ? "Open" : "Closed"
  const bg = isOpen
    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
    : "bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200"
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bg}`}
    >
      {label}
    </span>
  )
}

export default async function IssueDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; issueNumber: string }>
  searchParams: Promise<{ repo?: string }>
}) {
  const { id: owner, issueNumber } = await params
  const { repo: repoName } = await searchParams
  const session = await auth()

  if (!repoName) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <p className="font-medium">Repository not specified</p>
        <p className="mt-1 text-sm">Open this page from a repository issue link.</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  if (!session?.accessToken) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <p className="font-medium">Not authenticated</p>
        <p className="mt-1 text-sm">Sign in to view issue details.</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const baseUrl = getBaseUrl()
  const token = session.accessToken

  let issue: IssueDetail | null = null
  let issueError: string | null = null

  try {
    const res = await fetch(
      `${baseUrl}/api/fetchIssueDetail?owner=${encodeURIComponent(owner)}&repoName=${encodeURIComponent(repoName)}&issueNumber=${encodeURIComponent(issueNumber)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    )
    const json = await res.json()
    if (!res.ok) {
      issueError = json.message ?? json.error ?? "Failed to fetch issue"
    } else if (json.success && json.data) {
      issue = json.data as IssueDetail
    }
  } catch (e) {
    issueError = e instanceof Error ? e.message : "Failed to load issue"
  }

  if (issueError || !issue) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          <p className="font-medium">Could not load issue</p>
          <p className="mt-1 text-sm">{issueError ?? "Not found"}</p>
        </div>
        <Link
          href={`/repo/${owner}/issues?repo=${encodeURIComponent(repoName)}`}
          className="inline-block text-sm text-neutral-600 hover:underline dark:text-neutral-400"
        >
          ← Back to issues
        </Link>
      </div>
    )
  }

  const issuesUrl = `/repo/${owner}/issues?repo=${encodeURIComponent(repoName)}`

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-neutral-600 hover:underline dark:text-neutral-400"
        >
          Dashboard
        </Link>
        <span className="text-neutral-400 dark:text-neutral-500">/</span>
        <Link
          href={issuesUrl}
          className="text-neutral-600 hover:underline dark:text-neutral-400"
        >
          {owner} / {repoName}
        </Link>
        <span className="text-neutral-400 dark:text-neutral-500">/</span>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          Issue #{issue.number}
        </span>
      </div>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {stateBadge(issue.state)}
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            #{issue.number}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {issue.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          <a
            href={issue.user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <img
              src={issue.user.avatar_url}
              alt=""
              className="h-6 w-6 rounded-full"
            />
            <span>{issue.user.login}</span>
          </a>
          <span>opened {formatDate(issue.created_at)}</span>
          {issue.updated_at !== issue.created_at && (
            <span>· updated {formatDate(issue.updated_at)}</span>
          )}
          {issue.closed_at && (
            <span>· closed {formatDate(issue.closed_at)}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            View on GitHub →
          </a>
        </div>
      </header>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Comments
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {issue.comments} comment{issue.comments !== 1 ? "s" : ""}
          </p>
        </div>
        {issue.labels.length > 0 && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Labels
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {issue.labels.map((label) => (
                <span
                  key={label.name}
                  className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `#${label.color}20`,
                    color: `#${label.color}`,
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          </div>
        )}
        {issue.assignees.length > 0 && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Assignees
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {issue.assignees.map((a) => (
                <a
                  key={a.login}
                  href={a.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm hover:underline"
                >
                  <img
                    src={a.avatar_url}
                    alt=""
                    className="h-5 w-5 rounded-full"
                  />
                  <span>{a.login}</span>
                </a>
              ))}
            </div>
          </div>
        )}
        {issue.milestone && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Milestone
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {issue.milestone.title}
            </p>
            <p className="mt-0.5 text-xs capitalize text-neutral-500 dark:text-neutral-400">
              {issue.milestone.state}
            </p>
          </div>
        )}
      </section>

      {/* Description */}
      {issue.body && (
        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Description
          </h2>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/30">
            <pre className="whitespace-pre-wrap wrap-break-word font-sans text-sm text-neutral-800 dark:text-neutral-200">
              {issue.body}
            </pre>
          </div>
        </section>
      )}

      <Link
        href={issuesUrl}
        className="inline-block text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Back to issues
      </Link>
    </div>
  )
}
