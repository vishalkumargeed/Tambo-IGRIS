import { auth } from "@/auth"
import Link from "next/link"
import { RepoBreadcrumb } from "@/app/components/RepoBreadcrumb"

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

  const githubCodeUrl = `https://github.com/${owner}/${repoName}`

  return (
    <div className="space-y-6">
      <RepoBreadcrumb owner={owner} section="Code" />
      <div className="rounded-lg border border-neutral-200 bg-neutral-50/50 p-6 dark:border-neutral-700 dark:bg-neutral-900/50">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Code
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Browse the source code for {owner}/{repoName} on GitHub.
        </p>
        <a
          href={githubCodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          Browse code on GitHub →
        </a>
      </div>
    </div>
  )
}
