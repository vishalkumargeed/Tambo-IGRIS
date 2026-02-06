"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { IconChevronDown } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { useRepo } from "@/contexts/repo-context"

type RepoItem = { id: number; name: string; full_name: string; owner: string }

function getHeaderTitle(pathname: string | null): string {
  if (!pathname) return "Dashboard"
  if (pathname === "/dashboard") return "Dashboard"
  if (pathname.startsWith("/dashboard/issues")) return "Issues"
  if (pathname.startsWith("/dashboard/pull-requests")) return "Pull Requests"
  if (pathname.startsWith("/dashboard/code")) return "Codebase"
  return "Dashboard"
}

export function SiteHeader() {
  const pathname = usePathname()
  const { repo, setRepo } = useRepo()
  const [repos, setRepos] = React.useState<RepoItem[]>([])
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const title = getHeaderTitle(pathname)

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch("/api/userRepos")
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("Failed to fetch")))
      .then((body: { success?: boolean; data?: RepoItem[] }) => {
        if (body.success && Array.isArray(body.data)) setRepos(body.data)
      })
      .catch(() => setRepos([]))
      .finally(() => setLoading(false))
  }, [open])

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="hidden gap-1 sm:flex dark:text-foreground"
              >
                {repo ? repo.fullName : "Select a repo"}
                <IconChevronDown className="size-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 max-h-[70vh] overflow-y-auto">
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Your repositories
              </DropdownMenuLabel>
              {loading ? (
                <div className="flex items-center justify-center gap-2 px-2 py-4 text-sm text-muted-foreground">
                  <Spinner className="size-4" />
                  <span>Loading…</span>
                </div>
              ) : repos.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No repositories found
                </div>
              ) : (
                repos.map((r) => (
                  <DropdownMenuItem
                    key={r.id}
                    onClick={() => {
                      setRepo({
                        owner: r.owner,
                        name: r.name,
                        fullName: r.full_name,
                      })
                      setOpen(false)
                    }}
                    className="cursor-pointer"
                  >
                    <span className="truncate">{r.full_name}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <SidebarTrigger side="right" />
        </div>
      </div>
    </header>
  )
}
