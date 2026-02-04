import { auth } from "@/auth"
import Link from "next/link"
import { RepoBreadcrumb } from "@/app/components/RepoBreadcrumb"

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

type IssueItem = {
  number: number
  title: string
  state: string
  html_url?: string
  user?: { login: string; avatar_url?: string; html_url?: string }
  created_at?: string
  updated_at?: string
}

function formatRelativeTime(iso: string): string {
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

export default async function RepoIssuesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ repo?: string }>
}) {
  const { id: owner } = await params
  const { repo: repoName } = await searchParams
  const session = await auth()

  if (!repoName) {
    return (
      <div className="space-y-4">
        <RepoBreadcrumb owner={owner} section="Issues" />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">Repository not specified</p>
          <Link href="/dashboard" className="mt-2 inline-block text-sm underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!session?.accessToken) {
    return (
      <div className="space-y-4">
        <RepoBreadcrumb owner={owner} section="Issues" />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">Not authenticated</p>
          <Link href="/dashboard" className="mt-2 inline-block text-sm underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  const baseUrl = getBaseUrl()
  const token = session.accessToken
  let issues: IssueItem[] = []
  let issuesError: string | null = null

  try {
    const res = await fetch(
      `${baseUrl}/api/fetchIssues?owner=${encodeURIComponent(owner)}&repoName=${encodeURIComponent(repoName)}&state=open`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    )
    const json = await res.json()
    if (!res.ok) issuesError = json.message ?? json.error ?? "Failed to fetch issues"
    else if (json.success && Array.isArray(json.data)) issues = json.data as IssueItem[]
  } catch (e) {
    issuesError = e instanceof Error ? e.message : "Failed to fetch issues"
  }

  return (
    <div className="space-y-6">
      <RepoBreadcrumb owner={owner} section="Issues" />
      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Open issues
        </h2>
        {issuesError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            <p className="font-medium">Could not load issues</p>
            <p className="mt-1 text-sm">{issuesError}</p>
          </div>
        )}
        {!issuesError && issues.length === 0 && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No open issues.
          </p>
        )}
        {!issuesError && issues.length > 0 && (
          <ul className="space-y-2">
            {issues.map((issue) => (
              <li
                key={issue.number}
                className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-50/50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900/50 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`shrink-0 rounded-full  px-2 py-0.5 text-xs font-medium ${
                        issue.state === "open"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                          : "bg-neutral-200 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-200"
                      }`}
                    >
                      {issue.state === "open" ? "Open" : "Closed"}
                    </span>
                    <Link
                      href={`/repo/${owner}/issues/${issue.number}?repo=${encodeURIComponent(repoName)}`}
                      className="font-medium text-neutral-900 hover:underline dark:text-neutral-100"
                    >
                      #{issue.number} {issue.title}
                    </Link>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {issue.user && (
                      <a
                        href={issue.user.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:underline"
                      >
                        {issue.user.avatar_url && (
                          <img
                            src={issue.user.avatar_url}
                            alt=""
                            className="h-4 w-4 rounded-full"
                          />
                        )}
                        @{issue.user.login}
                      </a>
                    )}
                    <span>Updated {formatRelativeTime(issue.updated_at ?? issue.created_at ?? "")}</span>
                  </div>
                </div>
                {issue.html_url && (
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View on GitHub
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
