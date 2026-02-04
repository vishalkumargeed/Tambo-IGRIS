"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ChevronRight } from "lucide-react"

type RepoBreadcrumbProps = {
  owner?: string | null
  /** Current section label (e.g. "Code", "Issues", "Pull requests") */
  section?: string
}

export function RepoBreadcrumb({ owner = null, section }: RepoBreadcrumbProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const repo = searchParams.get("repo")

  if (!owner || !repo) {
    return (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
      </div>
    )
  }

  const repoUrl = `/repo/${encodeURIComponent(owner)}?repo=${encodeURIComponent(repo)}`
  const parts: { label: string; href?: string }[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: owner, href: repoUrl },
    { label: repo, href: repoUrl },
  ]
  if (section) parts.push({ label: section })

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />}
          {p.href ? (
            <Link href={p.href} className="hover:underline">
              {p.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{p.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
