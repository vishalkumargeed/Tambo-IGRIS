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

  return (
    <div className="space-y-6">
      <RepoBreadcrumb owner={owner} section="Code" />
      {treeError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          <p className="font-medium">Could not load code</p>
          <p className="mt-1 text-sm">{treeError}</p>
        </div>
      ) : (
        <RepoCodeExplorer
          owner={owner}
          repoName={repoName}
          filePaths={filePaths}
        />
      )}
    </div>
  )
}
