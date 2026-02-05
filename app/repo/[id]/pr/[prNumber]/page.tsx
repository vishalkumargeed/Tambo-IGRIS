import { auth } from "@/auth"
import Link from "next/link"
import { PRFilesExplorer } from "@/app/components/PRFilesExplorer"
import { PRDescription } from "@/components/PRDescription"

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

type PRDetail = {
  number: number
  title: string
  body: string | null
  state: string
  html_url: string
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  user: { login: string; avatar_url: string; html_url: string }
  head: { ref: string; sha: string; repo?: { full_name: string } }
  base: { ref: string; sha: string; repo?: { full_name: string } }
  additions: number
  deletions: number
  changed_files: number
  mergeable: boolean | null
  mergeable_state: string
  commits: number
  comments: number
  review_comments: number
  draft?: boolean
  merged_by?: { login: string; html_url: string } | null
}

type PRFile = {
  filename: string
  status: string
  additions: number
  deletions: number
  changes: number
  patch?: string
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

function stateBadge(state: string, draft?: boolean) {
  const isOpen = state === "open"
  const isClosed = state === "closed"
  const label = draft ? "Draft" : isOpen ? "Open" : isClosed ? "Closed" : state
  const bg =
    draft
      ? "bg-neutral-200 dark:bg-neutral-700"
      : isOpen
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

export default async function PRDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; prNumber: string }>
  searchParams: Promise<{ repo?: string }>
}) {
  const { id: owner, prNumber } = await params
  const { repo: repoName } = await searchParams
  const session = await auth()

  if (!repoName) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <p className="font-medium">Repository not specified</p>
        <p className="mt-1 text-sm">Open this page from a repository PR link.</p>
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
        <p className="mt-1 text-sm">Sign in to view PR details.</p>
        <Link href="/dashboard" className="mt-2 inline-block text-sm underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const baseUrl = getBaseUrl()
  const token = session.accessToken

  let pr: PRDetail | null = null
  let prError: string | null = null
  let files: PRFile[] = []

  try {
    const [prRes, filesRes] = await Promise.all([
      fetch(
        `${baseUrl}/api/fetchPRDetail?owner=${encodeURIComponent(owner)}&repoName=${encodeURIComponent(repoName)}&prNumber=${encodeURIComponent(prNumber)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 60 },
        }
      ),
      fetch(
        `${baseUrl}/api/fetchPR/fetchFiles?owner=${encodeURIComponent(owner)}&repoName=${encodeURIComponent(repoName)}&prNumber=${encodeURIComponent(prNumber)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 60 },
        }
      ),
    ])

    const prJson = await prRes.json()
    if (!prRes.ok) {
      prError = prJson.message ?? prJson.error ?? "Failed to fetch PR"
    } else if (prJson.success && prJson.data) {
      pr = prJson.data as PRDetail
    }

    const filesJson = await filesRes.json()
    if (filesRes.ok && filesJson.success && Array.isArray(filesJson.data)) {
      files = filesJson.data as PRFile[]
    }
  } catch (e) {
    prError = e instanceof Error ? e.message : "Failed to load PR"
  }

  if (prError || !pr) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          <p className="font-medium">Could not load PR</p>
          <p className="mt-1 text-sm">{prError ?? "Not found"}</p>
        </div>
        <Link
          href={`/repo/${owner}?repo=${encodeURIComponent(repoName)}`}
          className="inline-block text-sm text-neutral-600 hover:underline dark:text-neutral-400"
        >
          ← Back to repository
        </Link>
      </div>
    )
  }

  const repoUrl = `/repo/${owner}?repo=${encodeURIComponent(repoName)}`

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Breadcrumb & back */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-neutral-600 hover:underline dark:text-neutral-400"
        >
          Dashboard
        </Link>
        <span className="text-neutral-400 dark:text-neutral-500">/</span>
        <Link
          href={repoUrl}
          className="text-neutral-600 hover:underline dark:text-neutral-400"
        >
          {owner} / {repoName}
        </Link>
        <span className="text-neutral-400 dark:text-neutral-500">/</span>
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          PR #{pr.number}
        </span>
      </div>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {stateBadge(pr.state, pr.draft)}
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            #{pr.number}
          </span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {pr.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          <a
            href={pr.user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <img
              src={pr.user.avatar_url}
              alt=""
              className="h-6 w-6 rounded-full"
            />
            <span>{pr.user.login}</span>
          </a>
          <span>opened {formatDate(pr.created_at)}</span>
          {pr.updated_at !== pr.created_at && (
            <span>· updated {formatDate(pr.updated_at)}</span>
          )}
          {pr.merged_at && (
            <>
              <span>· merged {formatDate(pr.merged_at)}</span>
              {pr.merged_by && (
                <a
                  href={pr.merged_by.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  by @{pr.merged_by.login}
                </a>
              )}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={pr.html_url}
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
            Branch
          </p>
          <p className="mt-1 font-mono text-sm">
            <span className="text-neutral-600 dark:text-neutral-400">
              {pr.base.ref}
            </span>
            <span className="mx-1 text-neutral-400">←</span>
            <span className="text-neutral-900 dark:text-neutral-100">
              {pr.head.ref}
            </span>
          </p>
          <p className="mt-0.5 font-mono text-xs text-neutral-500">
            {pr.head.sha.slice(0, 7)}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Changes
          </p>
          <p className="mt-1 text-sm">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              +{pr.additions}
            </span>
            <span className="text-neutral-400"> / </span>
            <span className="font-medium text-red-600 dark:text-red-400">
              −{pr.deletions}
            </span>
            <span className="text-neutral-500"> · {pr.changed_files} files</span>
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Activity
          </p>
          <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
            {pr.commits} commit{pr.commits !== 1 ? "s" : ""} · {pr.comments}{" "}
            comment{pr.comments !== 1 ? "s" : ""} · {pr.review_comments} review
            comment{pr.review_comments !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-700 dark:bg-neutral-900/50">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Merge status
          </p>
          <p className="mt-1 text-sm capitalize text-neutral-900 dark:text-neutral-100">
            {pr.mergeable_state.replace(/_/g, " ") ?? "—"}
          </p>
          {pr.mergeable !== null && (
            <p className="mt-0.5 text-xs text-neutral-500">
              Mergeable: {pr.mergeable ? "Yes" : "No"}
            </p>
          )}
        </div>
      </section>

      {/* Description */}
      {pr.body && (
        <section>
          <PRDescription body={pr.body} />
        </section>
      )}

      {/* Files changed – FileTree + content from GET .../pulls/{pull_number}/files */}
      {files.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Files changed ({files.length})
          </h2>
          <PRFilesExplorer files={files} />
        </section>
      )}

      <Link
        href={repoUrl}
        className="inline-block text-sm text-neutral-600 hover:underline dark:text-neutral-400"
      >
        ← Back to repository
      </Link>
    </div>
  )
}
