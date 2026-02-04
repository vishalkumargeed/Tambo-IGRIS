import { auth } from "@/auth"
import Link from "next/link"
import { RepoBreadcrumb } from "@/app/components/RepoBreadcrumb"
import { RepoCodeExplorer } from "@/app/components/RepoCodeExplorer"

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export default async function RepoCodePage({
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
        <RepoBreadcrumb owner={owner} section="Code" />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-medium">Repository not specified</p>
          <p className="mt-1 text-sm">Open this page from a repository link.</p>
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
        <RepoBreadcrumb owner={owner} section="Code" />
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
  let filePaths: string[] = []
  let treeError: string | null = null

  try {
    const res = await fetch(
      `${baseUrl}/api/repoTree?owner=${encodeURIComponent(owner)}&repoName=${encodeURIComponent(repoName)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    )
    const json = await res.json()
    if (!res.ok) treeError = json.message ?? json.error ?? "Failed to load repository tree"
    else if (json.success && Array.isArray(json.data)) filePaths = json.data
  } catch (e) {
    treeError = e instanceof Error ? e.message : "Failed to load tree"
  }

  const githubRepoUrl = `https://github.com/${owner}/${repoName}`

  return (
    <div className="space-y-6">
      <RepoBreadcrumb owner={owner} section="Code" />

      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
        <p className="font-medium">Why we recommend viewing code on GitHub</p>
        <ul className="mt-2 text-sm leading-relaxed list-disc pl-5 space-y-1">
     
          <li>
            Large repositories can hit API rate and size limits.
          </li>
          <li>
            Some file types (such as binary files) aren’t viewable.
          </li>
          <li>
            Navigation features like search, history, and blame are limited.
          </li>
          <li>
            GitHub is optimized for code browsing and provides the best experience.
          </li>
          <li>
            Use the button below to open this repository directly on GitHub.
          </li>
        </ul>
        <a
          href={githubRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center rounded-md border border-amber-400 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-200 dark:border-amber-600 dark:bg-amber-900/60 dark:text-amber-100 dark:hover:bg-amber-900/80"
        >
          Open repository on GitHub →
        </a>
      </div>

    
    </div>
  )
}
