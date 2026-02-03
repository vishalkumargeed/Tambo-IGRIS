import { auth } from "@/auth"
import Link from "next/link"

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
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

  let prs: { number: number; title: string; state: string; html_url?: string }[] = []
  let prsError: string | null = null
  try {
    const prRes = await fetch(
      `${baseUrl}/api/fetchPR?owner=${encodeURIComponent(owner)}&repoName=${encodeURIComponent(repoName)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      }
    )
    const prJson = await prRes.json()
    if (!prRes.ok) {
      prsError = prJson.message ?? prJson.error ?? "Failed to fetch PRs"
    } else if (prJson.success && Array.isArray(prJson.data)) {
      prs = prJson.data
    }
  } catch (e) {
    prsError = e instanceof Error ? e.message : "Failed to fetch PRs"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          {owner} / {repoName}
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Open pull requests and details
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
        {prs.length === 0 && !prsError && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">No open pull requests.</p>
        )}
        {prs.length > 0 && (
          <ul className="space-y-2">
            {prs.map((pr) => (
              <li
                key={pr.number}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50/50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900/50"
              >
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  #{pr.number} {pr.title}
                </span>
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
              </li>
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
