"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Code2, CircleDot, GitPullRequest } from "lucide-react"
import { useEffect, useState } from "react"

type RepoNavProps = {
  owner?: string | null
  /** When false (e.g. on dashboard), show nav without repo links/counts */
  repoContext?: boolean
}

export function RepoNav({ owner = null, repoContext = true }: RepoNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const repo = searchParams.get("repo")
  const [counts, setCounts] = useState<{ openPrs: number; openIssues: number } | null>(null)

  useEffect(() => {
    if (!repoContext || !owner || !repo) return
    let cancelled = false
    fetch(`/api/repoCounts?owner=${encodeURIComponent(owner)}&repoName=${encodeURIComponent(repo)}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled && json?.success && json?.data) setCounts(json.data)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [repoContext, owner, repo])

  const base = owner ? `/repo/${encodeURIComponent(owner)}` : "#"
  const q = repo ? `?repo=${encodeURIComponent(repo)}` : ""
  const showCounts = repoContext && owner && repo && counts

  const isCode = pathname.endsWith("/code")
  const isIssues = pathname.includes("/issues")
  const isPulls = !isCode && !isIssues && pathname.includes("/repo/") && !pathname.includes("/pr/")

  const linkClass =
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted/80 hover:text-foreground"
  const activeClass = "bg-muted font-medium"

  if (!repoContext || !owner) {
    return (
      <nav className="border-b border-border bg-muted/30">
        <div className="flex justify-center gap-8 px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Code2 className="h-4 w-4" />
            Code
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleDot className="h-4 w-4" />
            Issues
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <GitPullRequest className="h-4 w-4" />
            Pull requests
          </span>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b border-border bg-muted/30">
      <div className="flex justify-center gap-8 px-4 py-3">
        <Link
          href={`${base}/code${q}`}
          className={`${linkClass} ${isCode ? activeClass : ""}`}
        >
          <Code2 className="h-4 w-4 shrink-0" />
          Code
        </Link>
        <Link
          href={`${base}/issues${q}`}
          className={`${linkClass} ${isIssues ? activeClass : ""}`}
        >
          <CircleDot className="h-4 w-4 shrink-0" />
          Issues
          {showCounts && (
            <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground dark:bg-neutral-800">
              {counts?.openIssues}
            </span>
          )}
        </Link>
        <Link
          href={`${base}${q}`}
          className={`${linkClass} ${isPulls ? activeClass : ""}`}
        >
          <GitPullRequest className="h-4 w-4 shrink-0" />
          Pull requests
          {showCounts && (
            <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground dark:bg-neutral-800">
              {counts?.openPrs}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}
