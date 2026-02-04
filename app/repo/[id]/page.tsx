import { auth } from "@/auth"
import Link from "next/link"
import { RepoBreadcrumb } from "@/app/components/RepoBreadcrumb"

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

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
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined })
  } catch {
    return iso
  }
}

function PRListItem({
  pr,
  owner,
  repoName,
}: {
  pr: PRItem
  owner: string
  repoName: string
}) {
  const createdOrUpdated = pr.updated_at ?? pr.created_at
  const timeLabel = pr.state === "closed"
    ? pr.merged_at
      ? `Merged ${formatRelativeTime(pr.merged_at)}`
      : pr.closed_at
        ? `Closed ${formatRelativeTime(pr.closed_at)}`
        : "Closed"
    : createdOrUpdated
      ? `Updated ${formatRelativeTime(createdOrUpdated)}`
      : "Open"

  return (
    <li className="rounded-lg border border-neutral-200 bg-neutral-50/50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900/50">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
          <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                pr.state === "open"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                  : "bg-neutral-200 text-neutral-700 dark:bg-neutral-600 dark:text-neutral-200"
              }`}
            >
              {pr.state === "open" ? "Open" : "Closed"}
            </span>
            <Link
              href={`/repo/${owner}/pr/${pr.number}?repo=${encodeURIComponent(repoName)}`}
              className="font-medium text-neutral-900 hover:underline dark:text-neutral-100"
            >
              #{pr.number} {pr.title}
            </Link>
           
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {pr.user && (
              <a
                href={pr.user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:underline"
              >
                {pr.user.avatar_url && (
                  <img
                    src={pr.user.avatar_url}
                    alt=""
                    className="h-4 w-4 rounded-full"
                  />
                )}
                <span>@{pr.user.login}</span>
              </a>
            )}
            <span>{timeLabel}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {pr.html_url && (
            <a
              href={pr.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              View on GitHub
            </a>
          )}
        </div>
      </div>
    </li>
  )
}

export default async function RepoDetailsPage({
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
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <p className="font-medium">Repository not specified</p>
        <p className="mt-1 text-sm">Open this page from a repository link on the dashboard.</p>
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
        <p className="mt-1 text-sm">Sign in to view repository details.</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const baseUrl = getBaseUrl()
  const token = session.accessToken

  let openPrs: PRItem[] = []
  let closedPrs: PRItem[] = []
  let prsError: string | null = null
  try {
    const [openRes, closedRes] = await Promise.all([
      fetch(
        `${baseUrl}/api/fetchPR?owner=${encodeURIComponent(owner)}&repoName=${encodeURIComponent(repoName)}&state=open`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      ),
      fetch(
        `${baseUrl}/api/fetchPR?owner=${encodeURIComponent(owner)}&repoName=${encodeURIComponent(repoName)}&state=closed`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      ),
    ])
    const openJson = await openRes.json()
    const closedJson = await closedRes.json()
    if (!openRes.ok) prsError = openJson.message ?? openJson.error ?? "Failed to fetch open PRs"
    else if (openJson.success && Array.isArray(openJson.data)) openPrs = openJson.data as PRItem[]
    if (!closedRes.ok && !prsError) prsError = closedJson.message ?? closedJson.error ?? "Failed to fetch closed PRs"
    else if (closedRes.ok && closedJson.success && Array.isArray(closedJson.data)) closedPrs = closedJson.data as PRItem[]
  } catch (e) {
    prsError = e instanceof Error ? e.message : "Failed to fetch PRs"
  }

  return (
    <div className="space-y-6">
      <RepoBreadcrumb owner={owner} section="Pull requests" />
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {owner} / {repoName}
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Pull requests and repository details
        </p>
      </div>

      {prsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          <p className="font-medium">Could not load PRs</p>
          <p className="mt-1 text-sm">{prsError}</p>
        </div>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Open pull requests
        </h2>
        {openPrs.length === 0 && !prsError && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">No open pull requests.</p>
        )}
        {openPrs.length > 0 && (
          <ul className="space-y-2">
            {openPrs.map((pr) => (
              <PRListItem key={pr.number} pr={pr} owner={owner} repoName={repoName} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Closed pull requests
        </h2>
        {closedPrs.length === 0 && !prsError && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">No closed pull requests.</p>
        )}
        {closedPrs.length > 0 && (
          <ul className="space-y-2">
            {closedPrs.map((pr) => (
              <PRListItem key={pr.number} pr={pr} owner={owner} repoName={repoName} />
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/dashboard"
        className="inline-block text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Back to dashboard
      </Link>
    
    </div>
  )
}
